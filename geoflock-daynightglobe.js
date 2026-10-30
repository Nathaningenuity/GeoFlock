/* GeoFlock: the Day & Night globe.
   A second globe view of the Satellite map: the sunlit half shows the satellite picture (seas a little lighter and more
   turquoise), the dark half shows the City Lights picture, lit by real sun geometry: daylight fades with the sun's height (Lambert),
   twilight lasts to 12° below the horizon (nautical dusk), and city lights come on from sunset. The cloud layer is bright white by day and dark and faint by night, dimming the
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
uniform float uSpace; uniform sampler2D uSat; uniform sampler2D uNight; uniform sampler2D uCl; uniform float uClA; uniform vec3 uSun; uniform sampler2D uGlow; uniform float uGlowOn; uniform sampler2D uBathy; uniform float uBathyOn;
out vec4 o;
/*ICE_DEF*/
float gmin(float a, float b){ return abs(a) < abs(b) ? a : b; }
vec3 nrm(float phi, float lam){ return vec3(cos(phi)*cos(lam), cos(phi)*sin(lam), sin(phi)); }
/* sea colour from depth (metres below sea level), fixed stops, interpolated smoothly between them */
vec3 depthColour(float d){
  const vec3 c0 = vec3(0.498, 0.890, 0.839), c20 = vec3(0.235, 0.769, 0.753), c60 = vec3(0.118, 0.604, 0.682),
             c150 = vec3(0.090, 0.408, 0.561), c400 = vec3(0.059, 0.247, 0.447), c1000 = vec3(0.043, 0.165, 0.361), c3000 = vec3(0.031, 0.118, 0.282);
  if(d < 20.0) return mix(c0, c20, d / 20.0);
  if(d < 60.0) return mix(c20, c60, (d - 20.0) / 40.0);
  if(d < 150.0) return mix(c60, c150, (d - 60.0) / 90.0);
  if(d < 400.0) return mix(c150, c400, (d - 150.0) / 250.0);
  if(d < 1000.0) return mix(c400, c1000, (d - 400.0) / 600.0);
  if(d < 3000.0) return mix(c1000, c3000, (d - 1000.0) / 2000.0);
  return c3000; }
/* how land-like a satellite pixel is (0 = open water) */
float landish(vec3 c){ float l = dot(c, vec3(0.3, 0.55, 0.15)); return 1.0 - smoothstep(0.015, 0.07, c.b - max(c.r, c.g*0.82)) * (1.0 - smoothstep(0.28, 0.5, l)); }
/* closeness to the coast: 1 right at the shore, fading smoothly to 0 about 1.6° out to sea */
float shore(vec2 uv){ float a = 0.0; for(int i = 0; i < 8; i++){ float t = float(i) * 0.7853982 + 0.39; vec2 d = vec2(cos(t), sin(t));
  a = max(a, landish(texture(uSat, uv + d * vec2(0.0011, 0.0022)).rgb));
  a = max(a, 0.55 * landish(texture(uSat, uv + d * vec2(0.0026, 0.0052)).rgb));
  a = max(a, 0.22 * landish(texture(uSat, uv + d * vec2(0.0045, 0.009)).rgb)); } return a; }
/* how enclosed by land a water pixel is (lakes, narrow inland seas): the share of 16 directions, at two distances,
   that meet land; read from a blurred copy of the picture so the result changes smoothly (no blotches) */
float enclosed(vec2 uv){ float a = 0.0; for(int i = 0; i < 16; i++){ float t = float(i) * 0.3926991; vec2 d = vec2(cos(t), sin(t));
  a += landish(textureLod(uSat, uv + d * vec2(0.005, 0.01), 5.0).rgb) + landish(textureLod(uSat, uv + d * vec2(0.009, 0.018), 5.0).rgb); } return a / 32.0; }
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
    float lit = smoothstep(-0.208, 0.15, s);
    vec3 c = vec3(0.42, 0.66, 1.0);
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
  /* the sea is coloured entirely from real depth (ETOPO bathymetry, textures/BATHY.webp: sqrt(depth/3000 m) in 0–255),
     not blended with the satellite picture: light turquoise at the shore through teal and the shelf edge to a flat deep
     navy below 3000 m; the depth is read with smooth (bilinear) filtering, so the colours run as gradients */
  float bv = uBathyOn > 0.5 ? texture(uBathy, vec2(u, v)).r : 0.6;
  vec3 sea = depthColour(bv * bv * 3000.0);
  /* the sea floor drops from the shelf to the deep within a few kilometres, which would give a hard edge: the colour is
     averaged over the sea around each point (rings out to about 1.1°, land left out), so shallow turquoise fades
     gradually into the deep blue */
  if(uBathyOn > 0.5){ vec3 acc = sea * 2.0; float wt = 2.0;
    for(int i = 0; i < 10; i++){ float t = float(i) * 0.6283185 + 0.2; vec2 d = vec2(cos(t), sin(t)) * vec2(0.5, 1.0);
      for(int k = 1; k <= 4; k++){ float r = float(k) * 0.0015; float b = texture(uBathy, vec2(u, v) + d * r).r;
        float w = (1.25 - float(k) * 0.22) * smoothstep(0.03, 0.09, b); acc += depthColour(b * b * 3000.0) * w; wt += w; } }
    sea = acc / wt; }
  /* where the depth data says sea, it is sea: the satellite picture is replaced there, not blended */
  if(uBathyOn > 0.5) water = max(water, smoothstep(0.03, 0.09, bv));
  /* lakes (water enclosed by land) are not in the ocean depth data: give them a mid-depth blue */
  float lake = water > 0.0 ? smoothstep(0.45, 0.85, enclosed(vec2(u, v))) : 0.0;
  sea = mix(sea, depthColour(120.0), lake);
  day = mix(day, sea, water);
  /*ICE_MIX*/
  /* light from the real geometry. s is the sine of the sun's height above the horizon at this point.
     Direct sunlight on the ground scales with sin(height) (Lambert's law), so it fades gradually over the last ~30° before
     sunset; a gentle tone curve (like a camera exposure, as in real photos from space) keeps the day side bright.
     After sunset the sky still lights the ground: civil twilight to 6° below the horizon (s = -0.105), nautical to 12°
     (s = -0.208). City lights show from about sunset and are fully visible by nautical dusk. */
  /* a deliberately wide, smooth twilight (the owner asked for a much wider gradient than strict physics gives):
     the satellite picture starts dimming from about 35° of sun height and keeps darkening to about 18° below the
     horizon (the end of astronomical twilight); the city lights fade in over that same wide band, from just before
     sunset to full strength around 20° below. */
  /* the satellite picture fades evenly and slowly: 100% where the sun is ~50° up, down to almost nothing ~27° below */
  float t = clamp((s + 0.45) / 1.22, 0.0, 1.0);
  float light = mix(0.03, 1.0, t);
  /* the night picture steps in gradually: about 1% where the sun is still ~15° up, rising evenly to 100% at ~25° below */
  float lights = clamp((0.26 - s) / 0.68, 0.0, 1.0);
  ngt = max(ngt - vec3(0.035, 0.04, 0.06), 0.0) * 1.12;
  float cl = 0.0;
  if(uClA > 0.0){ cl = smoothstep(0.1, 0.86, textureGrad(uCl, vec2(uc, v), gx, gy).r) * uClA;
    float cs = smoothstep(0.1, 0.86, textureGrad(uCl, vec2(uc + 0.0018, v - 0.0014), gx, gy).r) * uClA;
    day *= 1.0 - 0.3 * cs; day = mix(day, vec3(0.97, 0.98, 1.0), cl * 0.95);
    ngt = ngt * (1.0 - cl * 0.7) + cl * 0.02; }
  vec3 col = day * light + ngt * lights;
  if(uSpace > 0.5){ col = mix(col, vec3(0.45, 0.68, 1.0), pow(1.0 - z, 2.4) * 0.6 * smoothstep(-0.105, 0.2, s)); }
  o = vec4(col, 1.0);
}`;
const VS="#version 300 es\nin vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
function prog(G){if(G._dng!==undefined)return G._dng;G._dng=null;const gl=G.gl;
 try{const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,window.gfSeaIce?gfSeaIce.patch(FS):FS));/* sea ice: geoflock-seaice.js */gl.bindAttribLocation(pr,gl.getAttribLocation(G.prog,"p"),"p");gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
  const u={};["uF","uC","uS","uLam0","uSp","uCp","uRoll","uSpace","uSat","uNight","uCl","uClA","uSun","uGlow","uGlowOn","uBathy","uBathyOn"].forEach(n=>u[n]=gl.getUniformLocation(pr,n));G._dng={pr,u}}
 catch(e){console.error("Day & Night globe:",e)}return G._dng}
/* the coastal glow picture: loaded once, one small GPU texture per globe */
let GLOW_IMG=null;
function glowTex(G){if(G._dngGlow)return G._dngGlow;if(!GLOW_IMG){GLOW_IMG=new Image();GLOW_IMG.onload=()=>{try{req()}catch(e){}};GLOW_IMG.src="textures/COAST_GLOW.webp"}
 if(!GLOW_IMG.complete||!GLOW_IMG.naturalWidth)return null;const gl=G.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,GLOW_IMG);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return G._dngGlow=t}
/* the ocean depth picture (ETOPO 0.1°): loaded once, one small GPU texture per globe */
let BATHY_IMG=null;
function bathyTex(G){if(G._dngBathy)return G._dngBathy;if(!BATHY_IMG){BATHY_IMG=new Image();BATHY_IMG.onload=()=>{try{req()}catch(e){}};BATHY_IMG.src="textures/BATHY.webp"}
 if(!BATHY_IMG.complete||!BATHY_IMG.naturalWidth)return null;const gl=G.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,BATHY_IMG);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return G._dngBathy=t}
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
   {const bt=bathyTex(this);gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,bt);gl.uniform1i(u.uBathy,6);gl.uniform1f(u.uBathyOn,bt?1:0)}
   {const gt=glowTex(this);gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,gt);gl.uniform1i(u.uGlow,5);gl.uniform1f(u.uGlowOn,gt?1:0)}
   try{window.gfSeaIce&&gfSeaIce.bind(this,P.pr,4)}catch(e){}
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return}}}catch(e){console.error(e)}
 return _draw.apply(this,arguments)}}
/* the night picture's GPU copy is let go on leaving, unless City Lights is the map showing */
function freeNight(){try{const G=amGlobe&&amGlobe.gl;if(!G||!G.tex.night||allMapsColorMode==="night")return;G.tex.night.list.forEach(t=>{try{G.gl.deleteTexture(t)}catch(e){}});delete G.tex.night}catch(e){}}



/* rivers and lakes are drawn over the picture in day colours; they are left off here */
function patchCfg(){if(typeof amGlobe==="undefined"||!amGlobe||amGlobe._dngCfg)return;amGlobe._dngCfg=1;const ov=amGlobe.cfg.overlays;
 amGlobe.cfg.overlays=function(){const o=ov.apply(this,arguments);if(S.on&&o){o.rivers=false;o.lakes=false}return o}}

/* the sun: shown only while the Time or Season slider is moving, then it stays ~2.5 s and fades out */
let sunAt=0,sunRaf=0;
function sunPing(){sunAt=performance.now();if(!sunRaf){const tick=()=>{const age=performance.now()-sunAt;try{amGlobe.request()}catch(e){}sunRaf=age<3400?requestAnimationFrame(tick):0};sunRaf=requestAnimationFrame(tick)}}
{const _dm=GlobeView.prototype._drawMeasure;GlobeView.prototype._drawMeasure=function(ctx,p){
 try{const age=performance.now()-sunAt,a=age<2500?1:Math.max(0,1-(age-2500)/900);
  if(a>0&&S.on&&typeof amGlobe!=="undefined"&&this===amGlobe&&!this._flat){const sp=[S.lon,S.lat],c=[-this.rot[0],-this.rot[1]];
   if(d3.geoDistance(sp,c)<Math.PI/2-.02){const q=p(sp);if(q){ctx.save();ctx.globalAlpha=a;const g=ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],16);g.addColorStop(0,"rgba(255,236,170,.75)");g.addColorStop(1,"rgba(255,210,90,0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],16,0,7);ctx.fill();ctx.fillStyle="#ffd34d";ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(q[0],q[1],5,0,7);ctx.fill();ctx.stroke();ctx.restore()}}}}
 catch(e){console.error(e)}return _dm.apply(this,arguments)}}
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
   '<label class="gf-dng-row"><span>Season</span><input type="range" min="-23.4" max="23.4" step="0.1" data-dng="lat" aria-label="Season: the latitude where the sun is overhead"><em class="gf-dng-season"></em></label>'+
   '<p class="gf-dng-note">Enhanced colour: the sea is coloured by its real depth (NOAA ETOPO), from turquoise shallows to the deep navy of the open ocean.</p>';
  const t=el.querySelector('[data-dng="time"]'),l=el.querySelector('[data-dng="lat"]');
  t.addEventListener("input",()=>{stop();S.lon=minToLon(+t.value);sunPing();ui(true);req()});
  l.addEventListener("input",()=>{stop();S.lat=+l.value;sunPing();ui(true);req()});
  el.querySelector('[data-dng="now"]').onclick=()=>{stop();const lat=S.lat;toNow();S.lat=lat;ui();req()};
  el.querySelector('[data-dng="reset"]').onclick=()=>{stop();toNow();ui();req()};
  el.querySelector('[data-dng="play"]').onclick=()=>{if(S.play)stop();else play()}}
 if(!el._spacer){el._spacer=document.createElement("div");el._spacer.className="gf-dng-spacer"}
 if(el._spacer.previousElementSibling!==host)host.after(el._spacer);if(el.previousElementSibling!==el._spacer)el._spacer.after(el);dragWire(el);return el}
/* the panel is a legend: in its place under the globe when that is on screen; otherwise it floats at the bottom of the
   window (scrollable if tall). In full screen it floats at the right. Floating, it can be dragged by its top row. */
function dragWire(el){if(el._drag)return;el._drag=1;let d=null;
 el.addEventListener("pointerdown",e=>{if(!el.classList.contains("gf-dng-float")&&!document.body.classList.contains("gf-fs"))return;if(!e.target.closest(".gf-dng-top")||e.target.closest("button,input"))return;
  const r=el.getBoundingClientRect();d={x:e.clientX-r.left,y:e.clientY-r.top};el.setPointerCapture(e.pointerId);e.preventDefault()});
 el.addEventListener("pointermove",e=>{if(!d)return;const w=el.offsetWidth,h=el.offsetHeight,x=Math.max(4,Math.min(innerWidth-w-4,e.clientX-d.x)),y=Math.max(4,Math.min(innerHeight-h-4,e.clientY-d.y));
  el.style.left=x+"px";el.style.top=y+"px";el.style.right="auto";el.style.bottom="auto";el.style.transform="none";el._moved=1});
 el.addEventListener("pointerup",()=>{d=null})}
function floatSync(){const el=document.getElementById("gfDngPanel");if(!el||el.hidden)return;const fs=document.body.classList.contains("gf-fs"),sp=el._spacer;
 let fl=fs;if(!fs&&sp){const r=sp.getBoundingClientRect(),h=el.classList.contains("gf-dng-float")?(sp._h||el.offsetHeight):el.offsetHeight;fl=r.top+Math.min(h,60)>innerHeight||r.top+h<0}
 try{const k=document.getElementById("flKey");const kv=k&&k.offsetParent&&getComputedStyle(k).display!=="none"&&!k.hidden?k.getBoundingClientRect().height+10:0;el.style.setProperty("--gf-dng-lift",Math.round(kv)+"px")}catch(e){}
 if(fl!==el.classList.contains("gf-dng-float")){if(fl&&sp){sp._h=el.offsetHeight;sp.style.height=sp._h+"px"}else if(sp){sp.style.height="0px"}
  el.classList.toggle("gf-dng-float",fl);if(!fl||!el._moved){["left","top","right","bottom","transform"].forEach(k=>el.style.removeProperty(k));el._moved=0}}}
addEventListener("scroll",()=>{try{floatSync()}catch(e){}},{passive:true});addEventListener("resize",()=>{try{floatSync()}catch(e){}});
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
/* Day & Night sits in the Satellite map's own measure row (like GDP / GDP per person): "Day & Night" (the default on
   the globe), "Day" (the plain satellite picture) or "Night" (the City Lights map, which needs the dark theme) */
function toNight(){const go=()=>{const n=document.querySelector('#allMapsToggleRow [data-allmaps-mode="night"]');if(n)n.click()};
 const dark=document.body.classList.contains("sky-night");if(dark){go();return}
 const m=document.createElement("div");m.className="gf-nightask";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");
 m.innerHTML='<div><div class="ico">🌙</div><h3>Night needs the dark theme</h3><p>City lights only show in the dark <b>Starlight</b> theme. Turn it on now? You can switch back with the sun button at the top.</p><div class="row"><button type="button" class="pri" data-y>Turn on dark mode</button><button type="button" data-n>Not now</button></div></div>';
 document.body.appendChild(m);const done=()=>m.remove();
 m.querySelector("[data-y]").onclick=()=>{done();try{stats.theme="night";applyTheme();saveStats()}catch(e){}setTimeout(go,250)};
 m.querySelector("[data-n]").onclick=done;m.addEventListener("click",e=>{if(e.target===m)done()});m.querySelector("[data-y]").focus()}
function chip(){const gOn=typeof amGlobeOn==="function"&&amGlobeOn(),host=document.getElementById(gOn?"amGlobeSubs":"allMapsSubModes");if(!host)return null;
 ["amGlobeSubs","allMapsSubModes"].forEach(id=>{const o=document.getElementById(id);if(o&&o!==host&&o.querySelector("[data-dng-sub]"))o.innerHTML=""});
 const want=typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="satellite"&&allMapsColorModeOn&&GLOBE_TEX.night&&FEATURES.globe&&!(typeof proj!=="undefined"&&proj.on);
 let c=document.getElementById("gfDngChip");
 if(!want){if(c&&c.parentNode===host)host.innerHTML="";return c}
 if(!c||c.parentNode!==host){host.innerHTML='<button type="button" class="chip sub-chip" id="gfDngChip" data-dng-sub="dn" title="The satellite globe lit by the sun: day on one half, city lights on the other">Day &amp; Night</button>'+
   '<button type="button" class="chip sub-chip" data-dng-sub="sat" title="The satellite picture in full daylight everywhere">Day</button>'+
   '<button type="button" class="chip sub-chip" data-dng-sub="night" title="City lights at night (needs the dark Starlight theme)">Night</button>';
  host.querySelectorAll("[data-dng-sub]").forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.dngSub;
   if(k==="night"){toNight();return}S.userDay=k==="sat";set(k==="dn")});c=document.getElementById("gfDngChip")}
 return c}
function allowed(){try{return appMode==="allmaps"&&FEATURES.globe&&!!GLOBE_TEX.night&&!(typeof proj!=="undefined"&&proj.on)&&!(typeof ps!=="undefined"&&ps)}catch(e){return false}}
function set(v){if(v&&!allowed())v=false;if(v===S.on){sync();return}
 if(v){const sat=document.querySelector('#allMapsToggleRow [data-allmaps-mode="satellite"]');if(allMapsColorMode!=="satellite"&&sat)sat.click();}
 S.on=v;
 if(v){toNow();
  try{S.wasFlat=!globePrefs().allmaps;globePrefs().allmaps=true;saveStats()}catch(e){}try{amGlobeSync()}catch(e){console.error(e)}patchCfg();try{if(cloudsOn())cloudsLoad()}catch(e){}nightReady()}
 else{stop();freeNight();if(S.wasFlat){S.wasFlat=false;try{globePrefs().allmaps=false;saveStats();amGlobeSync()}catch(e){}}}
 sync();req()}
function sync(){const c=chip(),view=document.getElementById("allMapsView");
 /* Day & Night is the default view of the Satellite globe: each time the Satellite map is opened on the globe */
 try{const satNow=allMapsColorModeOn&&allMapsColorMode==="satellite"&&amGlobeOn()&&!(amGlobe&&amGlobe._flat);
  if(satNow&&!S.wasSat){S.wasSat=true;if(!S.on&&!S.userDay&&allowed()){setTimeout(()=>set(true),0)}}else if(!satNow&&!S.on){S.wasSat=false;S.userDay=false}}catch(e){}
 if(S.on&&!(allowed()&&allMapsColorMode==="satellite"&&amGlobeOn()&&!(amGlobe&&amGlobe._flat))){S.on=false;stop();freeNight();req()}
 document.querySelectorAll("[data-dng-sub]").forEach(b=>{const k=b.dataset.dngSub;b.classList.toggle("active",k==="dn"?!!S.on:k==="sat"?!S.on:false)});
 if(c)c.setAttribute("aria-pressed",String(S.on));
 if(view)view.classList.toggle("gf-dng-on",S.on);
 const p=S.on?panel():document.getElementById("gfDngPanel");if(p){p.hidden=!S.on;if(p._spacer&&!S.on)p._spacer.style.height="0px";if(S.on){ui();floatSync()}}}
/* any other map chip, or the Flat map switch, leaves this view; the checks run after the click has done its work */
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest('#allMapsToggleRow [data-allmaps-mode], #amGlobeSwitch [data-view="flat"], #projTabChip');
 if(t&&S.on){S.on=false;stop();freeNight();
  /* back to the flat map if that is where Day & Night was opened from */
  if(S.wasFlat&&t.matches("[data-allmaps-mode]"))try{globePrefs().allmaps=false;saveStats()}catch(e){}
  S.wasFlat=false;setTimeout(()=>{try{amGlobeSync()}catch(e){}sync();req()},0)}},true);
{const _s=amGlobeSync;amGlobeSync=function(){const r=_s.apply(this,arguments);try{patchCfg();sync()}catch(e){console.error(e)}return r}}
if(typeof renderAllMapsView==="function"){const _r=renderAllMapsView;renderAllMapsView=function(){const r=_r.apply(this,arguments);try{sync()}catch(e){}return r}}
setInterval(()=>{try{if(document.getElementById("allMapsToggleRow"))sync()}catch(e){}},500);

const css=document.createElement("style");css.textContent=`
.gf-dng-chip span{ font-size:1.05em; margin-right:2px; }
/* full screen: the sun panel stands at the right edge, clear of the globe */
/* floating, it is a narrow vertical legend at the right, like the floating map key (and above it when both show) */
.gf-dng.gf-dng-float{ position:fixed !important; left:auto; right:16px; bottom:calc(16px + var(--gf-dng-lift,0px)); transform:none; width:280px; max-width:calc(100vw - 32px); max-height:min(420px,calc(100vh - 120px)); overflow:auto; margin:0 !important; z-index:791; box-shadow:0 8px 30px rgba(0,0,0,.3); }
.gf-dng.gf-dng-float .gf-dng-top{ flex-wrap:wrap; } .gf-dng.gf-dng-float .gf-dng-where{ flex-basis:100%; font-size:11.5px; }
.gf-dng.gf-dng-float .gf-dng-sp{ display:none; } .gf-dng.gf-dng-float .gf-dng-row > span{ width:46px; }
body.gf-fs .gf-dng.gf-dng-float{ bottom:auto; top:50%; transform:translateY(-50%); }
.gf-dng.gf-dng-float .gf-dng-top{ cursor:grab; } .gf-dng-spacer{ height:0; }
.gf-dng{ position:relative; z-index:5; max-width:620px; margin:8px auto 4px; padding:10px 14px 8px; border-radius:16px; background:var(--surface,#101c30); color:rgb(var(--text-rgb)); border:1px solid var(--line); box-shadow:0 4px 18px rgba(0,0,0,.18); font-size:13px; }
.gf-dng[hidden]{ display:none !important; }
.gf-dng-top{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px; }
.gf-dng-ico{ display:inline-flex; }
.gf-dng-note{ margin:4px 0 0; font-size:11px; opacity:.6; line-height:1.3; }
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
.gf-dng-season{ font-style:normal; font-size:11.5px; opacity:.75; text-align:right; }
/* the season slider is as long as the time slider; its date sits on a line of its own underneath */
.gf-dng-row:has(.gf-dng-season){ flex-wrap:wrap; row-gap:0; } .gf-dng-row .gf-dng-season{ flex-basis:100%; margin:-2px 0 0; }
body.sky-night .gf-dng{ background:#16213a; border-color:rgba(150,175,230,.22); box-shadow:0 4px 22px rgba(0,0,0,.45); }
body.sky-night .gf-dng-btn{ background:#22304f; border-color:rgba(150,175,230,.25); }
@media (max-width:600px){ .gf-dng{ margin:6px 0 4px; padding:8px 10px; } .gf-dng-where{ width:100%; order:9; } .gf-dng-season{ min-width:0; } }`;
document.head.appendChild(css);
window.gfDNG={on:()=>S.on,set,state:S,ui,req};
})();
