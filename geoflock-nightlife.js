/* GeoFlock: night creatures on the animal-migration stop "The biggest migration happens every night".
   Sea animals that rise to the surface after dark, or glow there, each at a place where they are well known. A creature
   shows only where it is night: as the Day & Night shading (or its time slider) sweeps daylight over it, it fades out, and
   where night falls it fades in, so dragging the dark side round the globe brings different animals up.
   How dark a place is comes from the stop's own sun (pscSun: its Time of day and Date sliders), else the Day & Night
   layer's (gfDNG.state.lon/lat): the point where the sun is overhead: the sun's height there is 90° minus the distance to that point. Fully shown from 8° below the horizon,
   gone at 2° above it. Placed with psScreen, like the walkers, so it follows the globe and the flat map. */
(function(){
const TOUR="amigration",TITLE="The biggest migration happens every night";
const JELLY='<svg viewBox="0 0 32 32" width="100%" height="100%"><path d="M5,16 Q5,5 16,5 Q27,5 27,16 Q22,14 16,16 Q10,14 5,16Z" fill="#b8a4ff" fill-opacity=".85" stroke="#e9e1ff" stroke-width="1"/>'+
 '<path d="M9,16 q-2,5 1,9 M13,16 q2,6 -1,11 M19,16 q-2,6 1,11 M23,16 q2,5 -1,9" fill="none" stroke="#d6cbff" stroke-width="1.4" stroke-linecap="round"/></svg>';
const C=[
 {at:[137.25,36.85],e:"🦑",ph:"photos/nl-firefly.webp",cr:"iNaturalist user kamataryo, CC0",n:"Firefly squid",w:"Toyama Bay, Japan: they rise from the deep in spring and light the bay blue"},
 {at:[-65.44,18.1],e:"✨",n:"Glowing plankton",w:"Mosquito Bay, Puerto Rico: dinoflagellates flash blue when the water moves"},
 {at:[73.45,3.6],e:"✨",n:"Sea of stars",w:"The Maldives: glowing plankton light up the waves on the beach"},
 {at:[-38,-60],e:"🦐",pf:"Antarctic krill (Euphausia superba).jpg",cr:"Uwe Kils, CC BY-SA 3.0",n:"Antarctic krill",w:"The Southern Ocean: swarms rise to feed near the surface at night"},
 {at:[-111.5,26.5],e:"🦑",ph:"photos/nl-humboldt.webp",cr:"NOAA/MBARI, public domain",n:"Humboldt squid",w:"Gulf of California: hunt near the surface after dark, deep down by day"},
 {at:[-32,38],e:"🐟",ph:"photos/nl-lantern.webp",cr:"HulloThere, CC BY 4.0",n:"Lanternfish",w:"The open Atlantic: the most numerous fish on Earth, with glowing spots"},
 {at:[63,16],e:"🐟",ph:"photos/nl-lantern.webp",cr:"HulloThere, CC BY 4.0",n:"Lanternfish",w:"The Arabian Sea: one of the biggest swarms of these small glowing fish"},
 {at:[-152,34],e:"🦐",pf:"Antarctic krill (Euphausia superba).jpg",cr:"Uwe Kils, CC BY-SA 3.0 (a krill)",n:"Copepods and krill",w:"The North Pacific: tiny crustaceans, the biggest daily migration of all"},
 {at:[-127,42],svg:JELLY,ph:"photos/nl-pyrosome.webp",cr:"Show_ryu, CC BY-SA 3.0",n:"Pyrosomes",w:"Off Oregon: glowing colonies rise with the night"},
 {at:[55.5,10.5],e:"✨",n:"A milky sea",w:"Off Somalia: glowing bacteria can light thousands of km² of sea"},
 {at:[150.8,-35.1],e:"✨",n:"Glowing tide",w:"Jervis Bay, Australia: sea sparkle turns the shallows blue"},
 {at:[-158.5,20.2],e:"🐟",ph:"photos/nl-lantern.webp",cr:"HulloThere, CC BY 4.0 (a lanternfish)",n:"The rising layer",w:"Off Hawaii: a whole layer of small fish, shrimp and squid rises hundreds of metres each dusk"},
 {at:[156,-17],svg:JELLY,ph:"photos/nl-comb.webp",cr:"OpenCage, CC BY-SA 2.5",n:"Comb jellies",w:"The Coral Sea: rows of tiny paddles that shimmer with light"}];
const R=Math.PI/180;
const clean=s=>String(s==null?"":s).replace(/​/g,"").trim();
const active=()=>{try{return typeof ps!=="undefined"&&ps&&ps.tour===TOUR&&clean((psSteps()[ps.i]||{}).title)===TITLE}catch(e){return false}};
/* how dark it is: 0 in daylight, 1 at night */
function dark(ll){let st=null;
 /* the stop's own sun (its Time of day and Date sliders), else the Day & Night layer's */
 try{const S=psSteps()[ps.i];if(S&&S.gfSun&&typeof pscSun==="function")st=pscSun(S)}catch(e){}
 if(!st)try{st=window.gfDNG&&gfDNG.state}catch(e){}
 let lon=st&&isFinite(st.lon)?st.lon:null,lat=st&&isFinite(st.lat)?st.lat:null;
 if(lon==null){const d=new Date(),h=d.getUTCHours()+d.getUTCMinutes()/60;lon=(12-h)*15;const n=(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-Date.UTC(d.getUTCFullYear(),0,0))/864e5;lat=-23.44*Math.cos(2*Math.PI*(n+10)/365)}
 const c=Math.sin(lat*R)*Math.sin(ll[1]*R)+Math.cos(lat*R)*Math.cos(ll[1]*R)*Math.cos((ll[0]-lon)*R),alt=Math.asin(Math.max(-1,Math.min(1,c)))/R;
 return Math.max(0,Math.min(1,(2-alt)/10))}
let lay=null,raf=0;
function build(box){lay=document.createElement("div");lay.className="gf-nl";
 /* a real photo where there is one (round, glowing), else the symbol */
 const src=c=>{if(c.ph)return c.ph;if(c.pf)try{if(typeof gfMergeExtra==="function")gfMergeExtra();const P=PS_PHOTO_DATA.find(x=>x&&x.f===c.pf&&x.d);if(P)return typeof gfSrc==="function"?gfSrc(P.d):P.d}catch(e){}return null};
 lay.innerHTML=C.map((c,i)=>{const im=src(c);return'<div class="gf-nl-c" data-i="'+i+'" title="'+c.n+' — '+c.w+(c.cr&&im?' (Photo: '+c.cr+')':'')+'"><div class="gf-nl-i'+(im?' gf-nl-ph':'')+'">'+(im?'<img src="'+im+'" alt="">':(c.svg||c.e))+'</div><span>'+c.n+'</span></div>'}).join("");
 box.appendChild(lay)}
function tick(n){raf=0;if(!active()){if(lay){lay.remove();lay=null}return}
 const box=psContainer&&psContainer();if(!box)return;if(!lay||lay.parentElement!==box){if(lay)lay.remove();build(box)}
 [...lay.children].forEach((el,i)=>{const c=C[i],s=psScreen(c.at);if(!s){el.style.opacity=0;return}const d=dark(c.at);
  const bob=Math.sin(n/700+i*1.7)*2.5;el.style.opacity=d.toFixed(2);el.style.pointerEvents=d>.3?"auto":"none";
  el.style.transform="translate("+s[0].toFixed(1)+"px,"+(s[1]+bob).toFixed(1)+"px)"});
 raf=requestAnimationFrame(tick)}
function kick(){if(!raf&&active())raf=requestAnimationFrame(tick)}
const css=document.createElement("style");css.textContent=`
.gf-nl{ position:absolute; inset:0; pointer-events:none; z-index:6; overflow:hidden; }
.gf-nl-c{ position:absolute; left:0; top:0; margin:-19px 0 0 -19px; display:flex; flex-direction:column; align-items:center; transition:opacity .35s linear; will-change:transform,opacity; cursor:help; }
.gf-nl-i{ width:30px; height:30px; font-size:24px; line-height:30px; text-align:center; border-radius:50%;
  background:radial-gradient(circle, rgba(120,230,255,.55) 0%, rgba(80,170,255,.18) 55%, rgba(80,170,255,0) 72%);
  filter:drop-shadow(0 0 6px rgba(130,235,255,.95)) drop-shadow(0 0 2px #fff); animation:gfNlGlow 2.6s ease-in-out infinite; }
.gf-nl-i.gf-nl-ph{ width:38px; height:38px; padding:0; border-radius:50%; overflow:hidden; border:2px solid rgba(190,245,255,.95); background:#06122a; }
.gf-nl-i.gf-nl-ph img{ width:100%; height:100%; object-fit:cover; display:block; }
.gf-nl-c:nth-child(2n) .gf-nl-i{ animation-delay:-1.3s; }
.gf-nl-c span{ margin-top:2px; padding:1px 6px; border-radius:999px; background:rgba(8,20,45,.72); color:#bff3ff; font:800 10px system-ui,sans-serif; white-space:nowrap; text-shadow:0 0 4px rgba(120,230,255,.8); }
@keyframes gfNlGlow{ 0%,100%{ filter:drop-shadow(0 0 4px rgba(130,235,255,.7)) drop-shadow(0 0 1px #fff); } 50%{ filter:drop-shadow(0 0 11px rgba(130,235,255,1)) drop-shadow(0 0 3px #fff); } }`;
document.head.appendChild(css);
let hooked=false;
function hook(){if(hooked||typeof psGo!=="function")return;hooked=true;const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);setTimeout(kick,600);return r}}
if(document.readyState==="complete")hook();else addEventListener("load",hook);
setTimeout(hook,1500);setInterval(kick,1000);
window.gfNightLife={dark,list:C};
})();
