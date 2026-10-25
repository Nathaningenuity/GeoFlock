/* GeoFlock toolkit: a wooden tray of real-looking tools at the bottom left of the Maps page (flat map and globe).
   Drag a tool out onto the map to use it, drag it back into the tray to put it away (clicking a tool works too).
   - Compass: sits where you drop it; the needle points to north at that spot (on the globe too), and its rim shows where it is
   - Ruler: measures the distance between two clicks (the map's own measuring tool)
   - Pens: marker, highlighter, quill, pencil, fountain pen and brush in twelve colours, plus an eraser; drawings stay put
     on the Earth when you zoom, pan or spin, and are saved
   - Pins: a little tin of pins; drag one out onto the map, or click the tin and then click the map; each pin has a name,
     a note and a kind (been there, want to go, note); drag a pin back into the tin to remove it. Saved.
   - Dice: roll for somewhere random
   - Palette: map colours, including treasure-map styles, your own relief colours, and recolouring any colour of the map shown
   - Country dragger: pick up a country and move it anywhere; its true size shows as it moves away from the equator
   - Sea level changer: from the last Ice Age to all ice melted
   Drawings and pins are stored by latitude and longitude, so they line up on both the flat map and the globe. */
(function(){
"use strict";
if(typeof d3==="undefined"||typeof amtToLL!=="function")return;
const NS="http://www.w3.org/2000/svg";
let UID=0;const uid=()=>"k"+(++UID);
const K=()=>{try{const k=stats.kit=stats.kit||{};k.pins=k.pins||[];k.ink=k.ink||[];k.recolor=k.recolor||{};return k}catch(e){return{pins:[],ink:[],recolor:{}}}};
let saveT=0;const save=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{saveStats()}catch(e){}},400)};
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);

/* ================= the art ================= */
const ART={
compass(u,deg){deg=deg||0;let t="";for(let i=0;i<32;i++){const a=i*Math.PI/16,r1=i%8===0?33:i%2?37:35;t+=`<line x1="${50+Math.sin(a)*r1}" y1="${50-Math.cos(a)*r1}" x2="${50+Math.sin(a)*39}" y2="${50-Math.cos(a)*39}" stroke="#4a3a24" stroke-width="${i%8===0?1.6:.7}"/>`}
 return`<svg viewBox="0 0 100 100" class="gfk-art"><defs><radialGradient id="${u}b" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff2b8"/><stop offset=".35" stop-color="#e2b55a"/><stop offset=".75" stop-color="#a87526"/><stop offset="1" stop-color="#6b4512"/></radialGradient><radialGradient id="${u}f" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e9dcc0"/></radialGradient><linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
 <circle cx="51" cy="53" r="47" fill="#000" opacity=".18"/><circle cx="50" cy="50" r="47" fill="url(#${u}b)"/><circle cx="50" cy="50" r="41" fill="#5a3c12" opacity=".5"/><circle cx="50" cy="50" r="40" fill="url(#${u}f)"/>${t}
 <g font-family="Georgia,serif" font-weight="700" font-size="9" fill="#3a2a16" text-anchor="middle"><text x="50" y="24" fill="#b0261c">N</text><text x="50" y="83">S</text><text x="79" y="53.5">E</text><text x="21" y="53.5">W</text></g>
 <g class="gfk-needle" transform="rotate(${deg} 50 50)"><path d="M50 18 L56 50 L44 50Z" fill="#c8281c"/><path d="M50 82 L56 50 L44 50Z" fill="#f4efe4" stroke="#8a7a62" stroke-width=".6"/><path d="M50 18 L56 50 L50 50Z" fill="#8e1a12" opacity=".5"/></g>
 <circle cx="50" cy="50" r="4" fill="url(#${u}b)" stroke="#5a3c12" stroke-width=".8"/><ellipse cx="38" cy="32" rx="22" ry="12" fill="url(#${u}g)" transform="rotate(-30 38 32)"/></svg>`},
ruler(u){let t="";for(let i=0;i<=36;i++){const x=12+i*4.9,h=i%6===0?11:i%3===0?8:5;t+=`<line x1="${x}" y1="6" x2="${x}" y2="${6+h}" stroke="#4a3216" stroke-width="${i%6===0?1.1:.7}"/>`;if(i%6===0&&i)t+=`<text x="${x}" y="27" font-size="7" font-family="Georgia,serif" fill="#4a3216" text-anchor="middle">${i/6}</text>`}
 return`<svg viewBox="0 0 200 40" class="gfk-art"><defs><linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d49c"/><stop offset=".55" stop-color="#d9a560"/><stop offset="1" stop-color="#a8723a"/></linearGradient><linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e7b4"/><stop offset=".5" stop-color="#c49a3c"/><stop offset="1" stop-color="#7d5a1c"/></linearGradient></defs>
 <rect x="3" y="5" width="194" height="32" rx="3" fill="#000" opacity=".18"/><rect x="2" y="2" width="194" height="32" rx="3" fill="url(#${u}w)" stroke="#8a5a28" stroke-width=".8"/>
 <path d="M10 22 C60 19 110 25 190 21 M10 29 C70 31 120 27 190 30" stroke="#b07a3e" stroke-width=".7" fill="none" opacity=".6"/>${t}
 <rect x="2" y="2" width="8" height="32" rx="2" fill="url(#${u}m)"/><rect x="188" y="2" width="8" height="32" rx="2" fill="url(#${u}m)"/><text x="100" y="32" font-size="5.5" font-family="Georgia,serif" fill="#6a4620" text-anchor="middle" letter-spacing="1">GEOFLOCK · CM</text></svg>`},
pinbox(u){const heads=[["#d8322a",22],["#2f6fd0",34],["#e8b828",46],["#d8322a",58],["#2f6fd0",70],["#3aa05a",82]];
 return`<svg viewBox="0 0 100 80" class="gfk-art"><defs><linearGradient id="${u}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9edf2"/><stop offset=".5" stop-color="#a9b3bf"/><stop offset="1" stop-color="#6d7885"/></linearGradient><linearGradient id="${u}l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c33a2c"/><stop offset="1" stop-color="#8e2016"/></linearGradient></defs>
 <ellipse cx="52" cy="74" rx="44" ry="5" fill="#000" opacity=".2"/><path d="M8 18 L92 18 L88 8 L12 8Z" fill="url(#${u}l)" stroke="#5e140d" stroke-width=".8"/><text x="50" y="16" font-size="6" font-family="Georgia,serif" font-weight="700" fill="#f7e2b0" text-anchor="middle">MAP PINS</text>
 <rect x="8" y="22" width="84" height="48" rx="4" fill="url(#${u}t)" stroke="#55606c" stroke-width=".8"/><rect x="13" y="27" width="74" height="38" rx="2" fill="#2d3a2c"/>
 ${heads.map(([c,x],i)=>`<line x1="${x}" y1="${40+(i%2)*6}" x2="${x+5}" y2="${60}" stroke="#c9ced6" stroke-width="1.2"/><circle cx="${x}" cy="${40+(i%2)*6}" r="5" fill="${c}"/><circle cx="${x-1.6}" cy="${38.4+(i%2)*6}" r="1.6" fill="#fff" opacity=".7"/>`).join("")}</svg>`},
pin(u,col){return`<svg viewBox="0 0 30 44" class="gfk-art"><defs><radialGradient id="${u}h" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".25" stop-color="${col}"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>
 <ellipse cx="19" cy="42" rx="5" ry="1.6" fill="#000" opacity=".25"/><line x1="15" y1="16" x2="17" y2="42" stroke="#b9c0c8" stroke-width="1.8"/><circle cx="15" cy="11" r="9" fill="${col}"/><circle cx="15" cy="11" r="9" fill="url(#${u}h)"/></svg>`},
die(u,n){n=n||5;const pip=(x,y)=>`<circle cx="${x}" cy="${y}" r="4" fill="#2a1d14"/>`;const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
 return`<svg viewBox="0 0 100 100" class="gfk-art"><defs><linearGradient id="${u}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#e6dcc4"/></linearGradient><linearGradient id="${u}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9ccb0"/><stop offset="1" stop-color="#b8a888"/></linearGradient></defs>
 <ellipse cx="54" cy="92" rx="38" ry="6" fill="#000" opacity=".2"/><path d="M22 30 L56 18 L86 30 L52 42Z" fill="#f4ecdc" stroke="#8a7a5a" stroke-width=".8"/><path d="M22 30 L52 42 L52 86 L22 72Z" fill="url(#${u}a)" stroke="#8a7a5a" stroke-width=".8"/><path d="M52 42 L86 30 L86 74 L52 86Z" fill="url(#${u}b)" stroke="#8a7a5a" stroke-width=".8"/>
 <g transform="matrix(.3 .12 0 .44 37 57)">${P[n].map(([x,y])=>pip(x*24,y*24)).join("")}</g><g transform="matrix(.3 -.12 0 .44 69 57)">${P[3].map(([x,y])=>pip(x*24,y*24)).join("")}</g><g transform="matrix(.3 .12 -.3 .12 54 30)">${P[1].map(([x,y])=>pip(x*24,y*24)).join("")}</g></svg>`},
palette(u){const dabs=[["#c8281c",30,30],["#e8a52a",48,22],["#f2d23a",66,24],["#3a9a4a",78,38],["#2f6fd0",74,56],["#ffffff",58,64]];
 return`<svg viewBox="0 0 100 80" class="gfk-art"><defs><linearGradient id="${u}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8c48c"/><stop offset="1" stop-color="#b07c44"/></linearGradient><radialGradient id="${u}s" cx="30%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
 <path d="M50 8 C82 6 98 26 92 46 C88 60 74 58 70 66 C66 76 52 78 38 74 C14 68 2 50 8 32 C12 18 30 9 50 8Z" fill="#000" opacity=".18" transform="translate(2 3)"/>
 <path d="M50 8 C82 6 98 26 92 46 C88 60 74 58 70 66 C66 76 52 78 38 74 C14 68 2 50 8 32 C12 18 30 9 50 8Z" fill="url(#${u}w)" stroke="#8a5a28" stroke-width="1"/><ellipse cx="30" cy="54" rx="7" ry="6" fill="#f3eee4" stroke="#8a5a28" stroke-width="1"/>
 ${dabs.map(([c,x,y])=>`<ellipse cx="${x}" cy="${y}" rx="7" ry="5.5" fill="${c}" stroke="rgba(0,0,0,.18)" stroke-width=".6"/><ellipse cx="${x-2}" cy="${y-1.6}" rx="3" ry="1.8" fill="url(#${u}s)"/>`).join("")}
 <path d="M16 74 L60 40" stroke="#6b4a2a" stroke-width="3.2" stroke-linecap="round"/><path d="M60 40 L66 35" stroke="#c9ced6" stroke-width="3.6"/><path d="M66 35 C70 31 74 30 75 29 C74 33 71 37 67 37Z" fill="#2f6fd0"/></svg>`},
dragger(u){/* a jigsaw piece printed with a map: a country lifted off the page */
 return`<svg viewBox="0 0 100 90" class="gfk-art"><defs><linearGradient id="${u}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe0ec"/><stop offset="1" stop-color="#7fb3cc"/></linearGradient><linearGradient id="${u}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b7d38c"/><stop offset="1" stop-color="#7fa858"/></linearGradient><clipPath id="${u}c"><path d="M20 20 H40 C38 10 52 10 50 20 H72 V40 C82 38 82 52 72 50 V72 H50 C52 82 38 82 40 72 H20 V50 C10 52 10 38 20 40Z"/></clipPath></defs>
 <path d="M24 28 H44 C42 18 56 18 54 28 H76 V48 C86 46 86 60 76 58 V80 H54 C56 90 42 90 44 80 H24 V58 C14 60 14 46 24 48Z" fill="#000" opacity=".22"/>
 <g transform="rotate(-6 46 46)"><path d="M20 20 H40 C38 10 52 10 50 20 H72 V40 C82 38 82 52 72 50 V72 H50 C52 82 38 82 40 72 H20 V50 C10 52 10 38 20 40Z" fill="url(#${u}p)"/>
 <g clip-path="url(#${u}c)"><path d="M30 24 C40 22 46 30 54 28 C62 26 66 34 62 42 C58 50 64 58 56 66 C50 72 46 64 42 60 C36 54 26 56 24 46 C22 36 24 26 30 24Z" fill="url(#${u}l)" stroke="#5a7a3a" stroke-width=".8"/>
 <path d="M18 34 H76 M18 52 H76 M36 14 V78 M56 14 V78" stroke="#fff" stroke-width=".5" opacity=".6"/></g>
 <path d="M20 20 H40 C38 10 52 10 50 20 H72 V40 C82 38 82 52 72 50 V72 H50 C52 82 38 82 40 72 H20 V50 C10 52 10 38 20 40Z" fill="none" stroke="#4a6a80" stroke-width="1.2"/></g></svg>`},
sea(u){/* a glass beaker of sea water, a paper boat afloat, level marks on the glass */
 return`<svg viewBox="0 0 80 100" class="gfk-art"><defs><linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb3d9"/><stop offset="1" stop-color="#1f5f8e"/></linearGradient><linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".25" stop-color="#fff" stop-opacity=".08"/><stop offset=".8" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient><clipPath id="${u}c"><path d="M16 14 H64 V86 C64 92 60 94 56 94 H24 C20 94 16 92 16 86Z"/></clipPath></defs>
 <ellipse cx="42" cy="96" rx="28" ry="3.5" fill="#000" opacity=".2"/>
 <g clip-path="url(#${u}c)"><path d="M10 46 C18 42 24 50 32 46 C40 42 46 50 54 46 C60 43 66 47 70 46 V100 H10Z" fill="url(#${u}w)"/><path d="M10 46 C18 42 24 50 32 46 C40 42 46 50 54 46 C60 43 66 47 70 46" fill="none" stroke="#bfe6f6" stroke-width="1.2"/></g>
 <path d="M30 44 L50 44 L46 49 L34 49Z" fill="#f6efe0" stroke="#8a7a5a" stroke-width=".6"/><path d="M40 44 L40 33 L47 42Z" fill="#fffaf0" stroke="#8a7a5a" stroke-width=".6"/>
 <path d="M16 14 H64 V86 C64 92 60 94 56 94 H24 C20 94 16 92 16 86Z" fill="url(#${u}g)" stroke="#8fb0c0" stroke-width="1.4"/><path d="M12 12 H68" stroke="#8fb0c0" stroke-width="2.4" stroke-linecap="round"/>
 ${[24,34,46,58,70,82].map((y,i)=>`<line x1="54" y1="${y}" x2="${i%2?60:63}" y2="${y}" stroke="#2c5468" stroke-width=".9"/>`).join("")}<text x="51" y="27" font-size="6" font-family="Georgia,serif" fill="#2c5468" text-anchor="end">+m</text><text x="51" y="73" font-size="6" font-family="Georgia,serif" fill="#e8f4fa" text-anchor="end">−m</text></svg>`},
pencase(u){/* a leather pen roll with a quill, a marker and a pencil */
 return`<svg viewBox="0 0 90 80" class="gfk-art"><defs><linearGradient id="${u}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a5a2e"/><stop offset="1" stop-color="#5e3216"/></linearGradient></defs>
 <ellipse cx="46" cy="76" rx="40" ry="3.5" fill="#000" opacity=".2"/>
 <path d="M58 46 C54 30 60 10 76 2 C72 14 70 24 66 32 C64 38 62 42 60 46Z" fill="#f4efe6" stroke="#9a8a6a" stroke-width=".7"/><path d="M60 46 C64 30 70 16 76 2" stroke="#9a8a6a" stroke-width=".7" fill="none"/>
 <rect x="34" y="10" width="9" height="40" rx="2" fill="#c8281c"/><rect x="34" y="6" width="9" height="10" rx="2" fill="#7e1810"/>
 <path d="M18 18 L24 18 L24 50 L18 50Z" fill="#f2c12e" stroke="#9a7a1a" stroke-width=".6"/><path d="M18 18 L21 10 L24 18Z" fill="#e8c9a0"/><path d="M20.2 12.6 L21 10 L21.8 12.6Z" fill="#333"/>
 <path d="M6 44 H84 V70 C84 74 82 76 78 76 H12 C8 76 6 74 6 70Z" fill="url(#${u}l)" stroke="#3e1e0a" stroke-width=".8"/><path d="M10 50 H80" stroke="#c89060" stroke-width=".8" stroke-dasharray="2 2"/><path d="M10 70 H80" stroke="#c89060" stroke-width=".8" stroke-dasharray="2 2"/></svg>`}
};
/* pens: [id, name, width px, opacity, cap, art] */
const PENS=[
 ["marker","Marker",4,.92,"round"],["highlighter","Highlighter",16,.32,"butt"],["quill","Quill",2.2,.95,"round"],
 ["pencil","Pencil",1.6,.7,"round"],["fountain","Fountain pen",2.8,.95,"round"],["brush","Brush",8,.75,"round"],["eraser","Eraser",0,0,"round"]];
const INKS=["#1d1b18","#2a3f8f","#2f7fd0","#1e8c8a","#2f8f3e","#8a6a1a","#c8281c","#e8762a","#f2d23a","#e65aa0","#7a3fb0","#ffffff"];
function penArt(u,id,col){const c=col||"#1d1b18";
 const body={
  marker:`<rect x="8" y="22" width="14" height="66" rx="3" fill="#f4f4f2" stroke="#9a9a96" stroke-width=".8"/><rect x="8" y="58" width="14" height="30" rx="3" fill="${c}"/><path d="M10 22 L15 8 L20 22Z" fill="#2a2a2a"/><path d="M13.5 12 L15 8 L16.5 12Z" fill="${c}"/>`,
  highlighter:`<rect x="6" y="24" width="18" height="64" rx="4" fill="${c}" opacity=".9"/><rect x="6" y="24" width="18" height="64" rx="4" fill="#fff" opacity=".25"/><path d="M9 24 L12 10 L21 10 L21 24Z" fill="${c}"/><rect x="8" y="34" width="14" height="22" rx="2" fill="#fff" opacity=".4"/>`,
  quill:`<path d="M15 92 C14 70 16 40 26 6 C22 26 24 48 20 70 C19 80 17 88 15 92Z" fill="#f4efe6" stroke="#9a8a6a" stroke-width=".7"/><path d="M15 92 C18 60 22 30 26 6" stroke="#9a8a6a" stroke-width=".7" fill="none"/><path d="M13 86 L15 98 L17 86Z" fill="${c}"/>`,
  pencil:`<rect x="9" y="20" width="12" height="68" fill="#f2c12e" stroke="#9a7a1a" stroke-width=".6"/><rect x="9" y="80" width="12" height="8" fill="#c8b8a0"/><rect x="9" y="86" width="12" height="7" rx="2" fill="#e88a9a"/><path d="M9 20 L15 4 L21 20Z" fill="#e8c9a0"/><path d="M13.2 9 L15 4 L16.8 9Z" fill="${c}"/>`,
  fountain:`<rect x="8" y="24" width="14" height="66" rx="6" fill="#1d1b20"/><rect x="8" y="50" width="14" height="4" fill="#c9a24a"/><path d="M9 24 L15 4 L21 24Z" fill="#d9b45a" stroke="#8a6a1a" stroke-width=".6"/><path d="M15 6 V18" stroke="#6a4a10" stroke-width=".7"/><circle cx="15" cy="18" r="1.2" fill="#6a4a10"/><path d="M14 6 L15 4 L16 6Z" fill="${c}"/>`,
  brush:`<rect x="11" y="30" width="8" height="64" rx="3" fill="#b0763c"/><rect x="10" y="22" width="10" height="10" fill="#c9ced6"/><path d="M10 22 C10 12 13 6 15 2 C17 6 20 12 20 22Z" fill="#5a3a1a"/><path d="M11 14 C12 8 14 4 15 2 C16 4 18 8 19 14 C16 12 14 12 11 14Z" fill="${c}"/>`,
  eraser:`<path d="M6 40 L20 20 L28 26 L14 46Z" fill="#e8889a"/><path d="M6 40 L14 46 L14 86 L6 80Z" fill="#c86a7a"/><path d="M14 46 L28 26 L28 66 L14 86Z" fill="#f2a6b4"/><path d="M14 60 L28 40" stroke="#2f6fd0" stroke-width="7" opacity=".7"/>`}[id];
 return`<svg viewBox="0 0 30 100" class="gfk-art"><ellipse cx="18" cy="96" rx="9" ry="2.5" fill="#000" opacity=".18"/>${body}</svg>`}
function cursorFor(id,col){/* the pen leaning right like a hand holds it, tip down-left; the hot spot is computed from where the tip lands */
 const A=210;
 const tipY={marker:8,highlighter:10,quill:98,pencil:4,fountain:4,brush:2,eraser:40}[id]||4,tipX=id==="eraser"?6:15;
 /* the quill writes with its nib at the bottom of the drawing: turn it the other way round */
 const flip=id==="quill";const A2=flip?30:A;
 const R2=A2*Math.PI/180,c2=Math.cos(R2),s2=Math.sin(R2),rot2=(x,y)=>{const dx=x-15,dy=y-50;return[15+dx*c2-dy*s2,50+dx*s2+dy*c2]};
 const cs=[[0,0],[30,0],[0,100],[30,100]].map(([x,y])=>rot2(x,y)),X0=Math.min(...cs.map(p=>p[0])),Y0=Math.min(...cs.map(p=>p[1])),W=Math.max(...cs.map(p=>p[0]))-X0,H=Math.max(...cs.map(p=>p[1]))-Y0,S2=64/Math.max(W,H);
 const tip=rot2(tipX,tipY),hx=Math.round((tip[0]-X0)*S2),hy=Math.round((tip[1]-Y0)*S2);
 const inner=penArt("c",id,col).replace('<svg viewBox="0 0 30 100" class="gfk-art">','').replace("</svg>","");
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+Math.round(W*S2)+'" height="'+Math.round(H*S2)+'" viewBox="'+X0.toFixed(2)+' '+Y0.toFixed(2)+' '+W.toFixed(2)+' '+H.toFixed(2)+'"><g transform="rotate('+A2+' 15 50)">'+inner+'</g></svg>';
 return"url(\"data:image/svg+xml,"+encodeURIComponent(svg)+"\") "+Math.max(0,Math.min(63,hx))+" "+Math.max(0,Math.min(63,hy))+", crosshair"}
/* ================= map helpers ================= */
const onGlobe=()=>{try{return amGlobeOn()&&amGlobe&&amGlobe.host&&amGlobe.host.offsetParent}catch(e){return false}};
const host=()=>onGlobe()?amGlobe.host:document.getElementById("allMapsWrap");
const svgEl=()=>amtSvg();
function toLL(cx,cy){if(onGlobe()){const r=amGlobe.canvas.getBoundingClientRect(),p=amGlobe.projection(),ll=p.invert([cx-r.left,cy-r.top]);if(!ll||!isFinite(ll[0]))return null;const r0=p.rotate();if(d3.geoDistance(ll,[-r0[0],-r0[1]])>Math.PI/2-.01)return null;return ll}return amtToLL(cx,cy)}
function toScreen(ll){if(onGlobe()){const p=amGlobe.projection(),r0=p.rotate();if(d3.geoDistance(ll,[-r0[0],-r0[1]])>Math.PI/2-.02)return null;const q=p(ll),r=amGlobe.canvas.getBoundingClientRect();return q?[r.left+q[0],r.top+q[1]]:null}
 const svg=svgEl(),q=svg&&amtFromLL(ll);if(!q)return null;const m=svg.getScreenCTM();if(!m)return null;const P=new DOMPoint(q[0],q[1]).matrixTransform(m);return[P.x,P.y]}
/* the flat map's projection as a d3 stream: Robinson turned by the map's east–west spin, then the spin's scale and shift */
function flatPath(){try{const S=SPIN.A,r0=GLOBE_ROBINSON0.rotate(),P=d3.geoRobinson().scale(GLOBE_ROBINSON0.scale()).translate(GLOBE_ROBINSON0.translate()).rotate([r0[0]+S.dl,r0[1],r0[2]]).precision(.2);
 return d3.geoPath({stream:s=>P.stream({point(x,y){const q=spinFromR(S.f,x,y);s.point(q[0],q[1])},lineStart(){s.lineStart()},lineEnd(){s.lineEnd()},polygonStart(){s.polygonStart()},polygonEnd(){s.polygonEnd()},sphere(){if(s.sphere)s.sphere()}})})}catch(e){return null}}
function unitsPerPx(){const svg=svgEl();if(!svg)return 1;const vb=svg.viewBox.baseVal,r=svg.getBoundingClientRect();return vb&&r.width?vb.width/r.width:1}
/* on the flat map, ask the map itself which country is under the pointer (the drawn outlines), then take its shape */
function countryAt(cx,cy){try{if(onGlobe()){const h=amGlobe.hit(cx,cy);return h&&h.f?h.f:null}
 const hide=[...document.querySelectorAll(".gfk-cap,.gfk-tray,.gfk-obj")];hide.forEach(x=>x.style.pointerEvents="none");let els;try{els=document.elementsFromPoint(cx,cy)}finally{hide.forEach(x=>x.style.pointerEvents="")}
 const el=els.find(x=>x.tagName==="path"&&/^[a-z]{2}$/i.test(x.id||""));const code=el&&el.id.toLowerCase();if(!code)return null;
 const fs=projFeatures().filter(f=>f.geometry&&String(f.properties.c).toLowerCase()===code);if(!fs.length)return null;if(fs.length===1)return fs[0];
 return fs.sort((a,b)=>d3.geoArea(b)-d3.geoArea(a))[0]}catch(e){return null}}
const nameOf=f=>{try{const c=f&&f.properties&&f.properties.c;return(COUNTRY_BY_CODE[c]||{}).n||f.properties.n||""}catch(e){return""}};
function redrawGlobe(){try{if(typeof amGlobe!=="undefined"&&amGlobe)amGlobe.request?amGlobe.request():amGlobe.render()}catch(e){}}

/* ================= state ================= */
const S={tray:null,open:true,place:{},pen:null,penCol:"#c8281c",pinArm:false,ghosts:[],stroke:null,drag:null};
const PINKIND={been:["Been there","#d8322a"],want:["Want to go","#2f6fd0"],note:["Note","#e8b828"]};

/* ================= rendering on the map ================= */
function moveGeom(geom,from,to){const r1=d3.geoRotation([-from[0],-from[1]]),r2=d3.geoRotation([-to[0],-to[1]]);const f=p=>r2.invert(r1(p));
 const ring=R=>R.map(f);return geom.type==="Polygon"?{type:"Polygon",coordinates:geom.coordinates.map(ring)}:{type:"MultiPolygon",coordinates:geom.coordinates.map(P=>P.map(ring))}}
function ghostGeom(g){if(!g._geo||g._at!==g.at+""){g._geo=typeof ptMoveGeom==="function"?ptMoveGeom(g.geom,g.home,g.at):moveGeom(g.geom,g.home,g.at);g._at=g.at+""}return g._geo}
const GHOST_COLS=["#e8762a","#7a3fb0","#1e8c8a","#c8281c","#2f6fd0","#3a9a4a"];
function penStyle(t){return PENS.find(p=>p[0]===t)||PENS[0]}
const inkCss=(c,P)=>`fill:none !important;stroke:${c} !important;stroke-width:${P[2]}px !important;stroke-opacity:${P[3]} !important;stroke-linecap:${P[4]} !important;stroke-linejoin:round !important;opacity:1 !important;stroke-dasharray:none !important;filter:none !important;`;
function renderFlat(){const svg=svgEl();if(!svg)return;let g=svg.querySelector(":scope > g#gfKitLayer");if(!g){g=document.createElementNS(NS,"g");g.id="gfKitLayer";g.setAttribute("data-spin","no");svg.appendChild(g)}else if(g.nextElementSibling)svg.appendChild(g);
 const path=flatPath();if(!path)return;const k=unitsPerPx();let h="";
 K().ink.forEach((s,i)=>{const P=penStyle(s.t);const d=path({type:"LineString",coordinates:s.p});if(!d)return;
  h+=`<path d="${d}" vector-effect="non-scaling-stroke" pointer-events="none" style="${inkCss(s.c,P)}${s.t==="highlighter"?"mix-blend-mode:multiply;":""}"/>`});
 if(S.stroke&&S.stroke.p.length>1){const P=penStyle(S.stroke.t),d=path({type:"LineString",coordinates:S.stroke.p});if(d)h+=`<path d="${d}" vector-effect="non-scaling-stroke" pointer-events="none" style="${inkCss(S.stroke.c,P)}"/>`}
 S.ghosts.forEach((G,i)=>{const d=path(ghostGeom(G));if(!d)return;const q=amtFromLL(G.at);
  h+=`<g class="gfk-ghost" data-gi="${i}"><path d="${d}" vector-effect="non-scaling-stroke" style="fill:${G.col} !important;fill-opacity:.45 !important;stroke:${G.col} !important;stroke-width:2px !important;stroke-opacity:1 !important;opacity:1 !important;cursor:grab;filter:drop-shadow(0 3px 4px rgba(0,0,0,.25)) !important"/>`+(q?`<text x="${q[0]}" y="${q[1]}" font-size="${12*k}" text-anchor="middle" font-weight="800" fill="#fff" stroke="${G.col}" stroke-width="${3*k}" paint-order="stroke" pointer-events="none">${esc(G.label)}</text>`:"")+`</g>`});
 K().pins.forEach((p,i)=>{const q=amtFromLL(p.ll);if(!q)return;const col=(PINKIND[p.k]||PINKIND.note)[1];
  h+=`<g class="gfk-pin" data-pi="${i}" transform="translate(${q[0]} ${q[1]}) scale(${k})" style="cursor:pointer"><ellipse cx="4" cy="0" rx="5" ry="1.6" fill="#000" opacity=".28"/><line x1="0" y1="-14" x2="1.5" y2="0" stroke="#aeb6bf" stroke-width="1.8"/><circle cx="0" cy="-20" r="7.5" fill="${col}" stroke="rgba(0,0,0,.35)" stroke-width=".8"/><circle cx="-2.4" cy="-22.6" r="2.4" fill="#fff" opacity=".7"/>`+(p.n?`<text x="10" y="-17" font-size="11" font-weight="800" fill="#1d2a3a" stroke="#fff" stroke-width="3" paint-order="stroke">${esc(p.n)}</text>`:"")+`</g>`});
 g.innerHTML=h}
function renderGlobe(ctx,p){const path=d3.geoPath(p,ctx);ctx.save();
 /* lakes take the shallowest sea colour of the chosen map style (the globe paints them a fixed blue) */
 try{const M=gfMS(),Sx=GF_STYLES[M.style],ov=amGlobe.cfg.overlays?amGlobe.cfg.overlays():{};if(Sx&&allMapsColorMode==="relief"&&ov.lakes){const O=globeOverlays(),c=[-amGlobe.rot[0],-amGlobe.rot[1]];
  ctx.fillStyle=Sx.sea[0][1];ctx.strokeStyle="rgba(0,0,0,.18)";ctx.lineWidth=.4;(O.lakes||[]).forEach(L=>{if(L.minor&&!ov.minorLakes&&!window._gfMinorOn)return;if(L.c&&d3.geoDistance(L.c,c)-(L.r||0)>Math.PI/2)return;ctx.beginPath();path(L);ctx.fill();ctx.stroke()})}}catch(e){}
 const strokes=K().ink.concat(S.stroke&&S.stroke.p.length>1?[S.stroke]:[]);
 strokes.forEach(s=>{const P=penStyle(s.t);ctx.globalAlpha=P[3];ctx.strokeStyle=s.c;ctx.lineWidth=P[2];ctx.lineCap=P[4];ctx.lineJoin="round";ctx.globalCompositeOperation=s.t==="highlighter"?"multiply":"source-over";ctx.beginPath();path({type:"LineString",coordinates:s.p});ctx.stroke()});
 ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";
 S.ghosts.forEach(G=>{ctx.beginPath();path(ghostGeom(G));ctx.fillStyle=G.col;ctx.globalAlpha=.45;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=G.col;ctx.lineWidth=2;ctx.stroke();const q=p(G.at),r0=p.rotate();if(q&&d3.geoDistance(G.at,[-r0[0],-r0[1]])<Math.PI/2){ctx.font="800 12px system-ui";ctx.textAlign="center";ctx.lineWidth=3;ctx.strokeStyle=G.col;ctx.strokeText(G.label,q[0],q[1]);ctx.fillStyle="#fff";ctx.fillText(G.label,q[0],q[1])}});
 const r0=p.rotate();K().pins.forEach(pn=>{if(d3.geoDistance(pn.ll,[-r0[0],-r0[1]])>Math.PI/2-.02)return;const q=p(pn.ll);if(!q)return;const col=(PINKIND[pn.k]||PINKIND.note)[1],[x,y]=q;
  ctx.fillStyle="rgba(0,0,0,.28)";ctx.beginPath();ctx.ellipse(x+4,y,5,1.6,0,0,7);ctx.fill();ctx.strokeStyle="#aeb6bf";ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x+1.5,y);ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-20,7.5,0,7);ctx.fill();ctx.strokeStyle="rgba(0,0,0,.35)";ctx.lineWidth=.8;ctx.stroke();ctx.fillStyle="rgba(255,255,255,.7)";ctx.beginPath();ctx.arc(x-2.4,y-22.6,2.4,0,7);ctx.fill();
  if(pn.n){ctx.font="800 11px system-ui";ctx.textAlign="left";ctx.lineWidth=3;ctx.strokeStyle="#fff";ctx.strokeText(pn.n,x+10,y-17);ctx.fillStyle="#1d2a3a";ctx.fillText(pn.n,x+10,y-17)}});
 ctx.restore()}
if(typeof GlobeView!=="undefined"){const _dm=GlobeView.prototype._drawMeasure;GlobeView.prototype._drawMeasure=function(ctx,p){try{if(typeof amGlobe!=="undefined"&&this===amGlobe)renderGlobe(ctx,p)}catch(e){console.error(e)}return _dm.apply(this,arguments)}}
let rq=0;function render(){if(rq)return;rq=requestAnimationFrame(()=>{rq=0;try{if(onGlobe())redrawGlobe();else renderFlat()}catch(e){console.error(e)}placeObjects();ghostButtons()})}
/* each lifted country gets a little × to put it back, and there is one button to put them all back */
function ghostButtons(){const h=host();document.querySelectorAll(".gfk-gx").forEach(x=>{if(!h||x.parentNode!==h||+x.dataset.gi>=S.ghosts.length)x.remove()});let all=h&&h.querySelector(":scope > .gfk-gall");
 if(!h||!S.ghosts.length){if(all)all.remove();return}const hr=h.getBoundingClientRect();
 S.ghosts.forEach((G,i)=>{let b=h.querySelector(':scope > .gfk-gx[data-gi="'+i+'"]');if(!b){b=document.createElement("button");b.type="button";b.className="gfk-gx";b.dataset.gi=i;b.title="Put it back";b.textContent="×";
   b.addEventListener("pointerdown",e=>e.stopPropagation(),true);b.onclick=e=>{e.stopPropagation();S.ghosts.splice(+b.dataset.gi,1);document.querySelectorAll(".gfk-gx").forEach(x=>x.remove());render()};h.appendChild(b)}
  const q=toScreen(G.at);if(!q){b.style.display="none";return}b.style.display="";b.style.left=q[0]-hr.left+"px";b.style.top=q[1]-hr.top-22+"px";b.style.borderColor=G.col;b.style.color=G.col});
 if(!all){all=document.createElement("button");all.type="button";all.className="gfk-gall";all.textContent="Put all countries back";all.addEventListener("pointerdown",e=>e.stopPropagation(),true);all.onclick=e=>{e.stopPropagation();S.ghosts.length=0;render()};h.appendChild(all)}}

/* ================= the tray ================= */
const TOOLS=[["compass","Compass","Drop it on the map: the needle points to north there"],["ruler","Ruler","Drop it on the map, then click two places to measure"],
 ["pens","Pens","Pick a pen and colour, then draw on the map"],["pins","Pins","Drag a pin onto the map, or click the tin and then click the map"],["dice","Dice","Roll for somewhere random"],
 ["palette","Palette","Map colours: styles, your own colours, recolour this map"],["dragger","Country dragger","Turn on, then press any country and drag it to see its true size elsewhere"],["sea","Sea level changer","Raise or lower the sea"]];
function artFor(t){const u=uid();return t==="compass"?ART.compass(u,0):t==="ruler"?ART.ruler(u):t==="pens"?ART.pencase(u):t==="pins"?ART.pinbox(u):t==="dice"?ART.die(u,5):t==="palette"?ART.palette(u):t==="dragger"?ART.dragger(u):ART.sea(u)}
function buildTray(){const tr=document.createElement("div");tr.id="gfKit";tr.className="gfk-tray";
 tr.innerHTML='<button type="button" class="gfk-tab" aria-expanded="true" title="Show or hide the toolkit"><span>Toolkit</span><i>▾</i></button><div class="gfk-felt">'+
  TOOLS.map(([id,n,t])=>`<button type="button" class="gfk-slot gfk-${id}" data-tool="${id}" title="${esc(t)}" aria-label="${esc(n)}">${artFor(id)}<span>${esc(n.replace("Country dragger","Dragger").replace("Sea level changer","Sea level"))}</span></button>`).join("")+"</div>";
 /* the map's hover label must not show through the tray */
 const hideTip=()=>document.querySelectorAll(".map-territory-tooltip, .map-tooltip, .globe-tip").forEach(x=>{x.classList.remove("show");x.style.opacity="0"});
 ["mousemove","mouseover","pointermove"].forEach(ev=>tr.addEventListener(ev,e=>{e.stopPropagation();hideTip()}));tr.addEventListener("mouseleave",()=>document.querySelectorAll(".map-territory-tooltip, .map-tooltip, .globe-tip").forEach(x=>x.style.opacity=""));
 tr.querySelector(".gfk-tab").onclick=()=>{S.open=!S.open;try{K().closed=!S.open;save()}catch(e){}sync()};
 tr.querySelectorAll(".gfk-slot").forEach(b=>wireDrag(b,b.dataset.tool,"tray"));
 ["pointerdown","mousedown","click","wheel","dblclick"].forEach(t=>tr.addEventListener(t,e=>e.stopPropagation()));
 return tr}
function overTray(cx,cy){const t=S.tray;if(!t||!t.isConnected)return false;const r=t.getBoundingClientRect();return cx>=r.left-6&&cx<=r.right+6&&cy>=r.top-6&&cy<=r.bottom+6}
function overMap(cx,cy){const h=host();if(!h)return false;const r=h.getBoundingClientRect();return cx>=r.left&&cx<=r.right&&cy>=r.top&&cy<=r.bottom&&!overTray(cx,cy)}

/* drag something (a tool from the tray, or a placed object) with a lifted copy under the pointer */
function wireDrag(el,tool,from){el.addEventListener("pointerdown",e=>{if(e.button)return;e.preventDefault();e.stopPropagation();const x0=e.clientX,y0=e.clientY;let fl=null;
 const mv=ev=>{if(!fl&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>6){fl=document.createElement("div");fl.className="gfk-float gfk-f-"+tool;fl.innerHTML=from==="tray"?artFor(tool==="pins"?"pins":tool):el.innerHTML;document.body.appendChild(fl);el.classList.add("gfk-lifted")}
  if(fl){fl.style.left=ev.clientX+"px";fl.style.top=ev.clientY+"px";fl.classList.toggle("gfk-home",overTray(ev.clientX,ev.clientY))}};
 const up=ev=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);el.classList.remove("gfk-lifted");
  if(!fl){if(from==="tray")clickTool(tool,el);else clickPlaced(tool);return}fl.remove();
  if(overTray(ev.clientX,ev.clientY)){putAway(tool);return}
  if(overMap(ev.clientX,ev.clientY))dropTool(tool,ev.clientX,ev.clientY)};
 addEventListener("pointermove",mv);addEventListener("pointerup",up)})}

/* placed objects (compass, ruler) are real things lying on the map, at a spot on the screen */
function placeObjects(){const h=host();Object.entries(S.place).forEach(([t,o])=>{if(!o.el.isConnected||o.el.parentNode!==h){if(h)h.appendChild(o.el)}
 if(t==="compass")updCompass(o)})}
function placeAt(tool,cx,cy){const h=host();if(!h)return;let o=S.place[tool];if(!o){const el=document.createElement("div");el.className="gfk-obj gfk-o-"+tool;el.innerHTML=artFor(tool);el.title=tool==="compass"?"Compass: drag it around; drag it back to the toolkit to put it away":"Ruler: click two places on the map to measure. Drag it back to the toolkit to put it away";
  ["pointerdown","mousedown","click","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation()));
  o=S.place[tool]={el};wireObj(o,tool);if(tool==="compass"){const r=document.createElement("div");r.className="gfk-cpos";el.appendChild(r)}}
 const hr=h.getBoundingClientRect();o.x=cx-hr.left;o.y=cy-hr.top;o.el.style.left=o.x+"px";o.el.style.top=o.y+"px";if(o.el.parentNode!==h)h.appendChild(o.el);sync();placeObjects()}
function wireObj(o,tool){o.el.addEventListener("pointerdown",e=>{if(e.button)return;e.preventDefault();e.stopPropagation();const h=host(),hr=h.getBoundingClientRect(),dx=e.clientX-hr.left-o.x,dy=e.clientY-hr.top-o.y;o.el.classList.add("gfk-held");
 const mv=ev=>{o.x=ev.clientX-hr.left-dx;o.y=ev.clientY-hr.top-dy;o.el.style.left=o.x+"px";o.el.style.top=o.y+"px";o.el.classList.toggle("gfk-home",overTray(ev.clientX,ev.clientY));if(tool==="compass")updCompass(o)};
 const up=ev=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);o.el.classList.remove("gfk-held","gfk-home");if(overTray(ev.clientX,ev.clientY))putAway(tool)};
 addEventListener("pointermove",mv);addEventListener("pointerup",up)})}
function updCompass(o){const h=host();if(!h)return;const hr=h.getBoundingClientRect(),cx=hr.left+o.x,cy=hr.top+o.y,ll=toLL(cx,cy),pos=o.el.querySelector(".gfk-cpos");let deg=0;
 if(ll){const a=toScreen(ll),b=toScreen([ll[0],Math.min(89.9,ll[1]+.6)]);if(a&&b)deg=Math.atan2(b[0]-a[0],-(b[1]-a[1]))*180/Math.PI;
  pos.textContent=Math.abs(ll[1]).toFixed(1)+"°"+(ll[1]>=0?"N":"S")+" "+Math.abs(ll[0]).toFixed(1)+"°"+(ll[0]>=0?"E":"W")}else pos.textContent="off the map";
 const n=o.el.querySelector(".gfk-needle");if(n){o.deg=o.deg==null?deg:o.deg+((((deg-o.deg)%360)+540)%360-180)*.35;n.setAttribute("transform","rotate("+o.deg.toFixed(1)+" 50 50)")}}
setInterval(()=>{const o=S.place.compass;if(o&&o.el.isConnected)updCompass(o)},60);

/* ================= what each tool does ================= */
function clickTool(t,el){const h=host();if(!h)return;const r=h.getBoundingClientRect();
 if(t==="compass"||t==="ruler"){if(S.place[t])putAway(t);else dropTool(t,r.left+r.width*(t==="compass"?.18:.5),r.top+r.height*(t==="compass"?.55:.8))}
 else if(t==="pens")penPicker();else if(t==="pins")pinMenu();else if(t==="dice")roll(el);else if(t==="palette")openPalette();else if(t==="dragger")dragPick();else if(t==="sea")seaPanel()}
function dropTool(t,cx,cy){if(t==="compass")placeAt("compass",cx,cy);
 else if(t==="ruler"){placeAt("ruler",cx,cy);measure(true)}
 else if(t==="pins")newPin(toLL(cx,cy),cx,cy);
 else if(t==="dice")roll(null,cx,cy);
 else if(t==="dragger"){const f=countryAt(cx,cy);dragOn(true);if(f&&f.properties.c!=="aq")lift(f)}
 else if(t==="pens")penPicker();else if(t==="palette")openPalette();else if(t==="sea")seaPanel()}
function clickPlaced(t){if(t==="ruler")measure(true)}
function putAway(t){const o=S.place[t];if(o){o.el.remove();delete S.place[t]}if(t==="ruler")measure(false);if(t==="pens")penStop();if(t==="pins")pinArm(false);if(t==="dragger")dragOn(false);sync()}
function measure(on){try{if(onGlobe()){if(!!amGlobe._measure!==on)amGlobe.toggleMeasure()}else amtToggleMeasure(on)}catch(e){}}

/* --- a small floating panel next to the tray --- */
const PPOS={};
function panel(id,html,wide){closePanels();const p=document.createElement("div");p.className="gfk-panel"+(wide?" gfk-wide":"");p.id=id;
 p.innerHTML='<div class="gfk-grip" title="Drag to move"><i></i></div><button type="button" class="gfk-px" aria-label="Close">×</button>'+html;document.body.appendChild(p);
 /* where it opens: where it was last left, else just above the toolkit */
 const pos=PPOS[id];if(pos){p.style.left=pos[0]+"px";p.style.top=pos[1]+"px"}else{const t=S.tray&&S.tray.isConnected?S.tray.getBoundingClientRect():null;const left=t?t.left:20,top=(t?t.top:innerHeight-120)-p.offsetHeight-10;p.style.left=Math.max(8,left)+"px";p.style.top=Math.max(8,top)+"px"}
 clampPanel(p);p.querySelector(".gfk-px").onclick=()=>{if(id==="gfkPins"&&S.pinArm)pinArm(false);closePanels()};["pointerdown","mousedown","click","wheel","dblclick","keydown"].forEach(t=>p.addEventListener(t,e=>e.stopPropagation()));
 /* drag it by its header (the title line) anywhere on the page */
 p.addEventListener("pointerdown",e=>{if(!e.target.closest(".gfk-grip,.gfk-ph"))return;e.preventDefault();const r=p.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;p.classList.add("gfk-moving");
  const mv=ev=>{p.style.left=ev.clientX-dx+"px";p.style.top=ev.clientY-dy+"px";clampPanel(p)};const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);p.classList.remove("gfk-moving");PPOS[id]=[parseFloat(p.style.left),parseFloat(p.style.top)]};
  addEventListener("pointermove",mv);addEventListener("pointerup",up)});
 return p}
function clampPanel(p){const r=p.getBoundingClientRect();let l=parseFloat(p.style.left)||0,t=parseFloat(p.style.top)||0;l=Math.max(4-r.width+60,Math.min(innerWidth-60,l));t=Math.max(4,Math.min(innerHeight-40,t));p.style.left=l+"px";p.style.top=t+"px"}
function closePanels(){document.querySelectorAll(".gfk-panel").forEach(p=>p.remove())}
function toast(t){const h=host();if(!h)return;let m=h.querySelector(":scope > .gfk-toast");if(!m){m=document.createElement("div");m.className="gfk-toast";h.appendChild(m)}m.textContent=t;m.classList.add("on");clearTimeout(m._t);m._t=setTimeout(()=>m.classList.remove("on"),2600)}

/* --- pens --- */
function penPicker(){const p=panel("gfkPens",'<b class="gfk-ph">Pens</b><div class="gfk-penrow">'+PENS.map(([id,n])=>`<button type="button" class="gfk-pen${S.pen===id?" on":""}" data-pen="${id}" title="${n}">${penArt(uid(),id,id==="eraser"?null:S.penCol)}<span>${n}</span></button>`).join("")+'</div>'+
 '<div class="gfk-inks">'+INKS.map(c=>`<button type="button" data-ink="${c}" class="${c===S.penCol?"on":""}" style="--c:${c}" aria-label="Colour ${c}"></button>`).join("")+'<label class="gfk-own" title="Any colour"><input type="color" value="'+S.penCol+'"></label></div>'+
 '<div class="gfk-acts"><button type="button" data-act="undo">Undo</button><button type="button" data-act="clear">Clear all drawings</button>'+(S.pen?'<button type="button" data-act="stop" class="pri">Put the pen down</button>':"")+'</div><p class="gfk-hint">Pick a pen to draw. Drawings stay on the Earth as you zoom, pan or spin, and are saved.</p>');if(!p)return;
 p.querySelectorAll("[data-pen]").forEach(b=>b.onclick=()=>{penStart(b.dataset.pen);penPicker()});
 p.querySelectorAll("[data-ink]").forEach(b=>b.onclick=()=>{S.penCol=b.dataset.ink;if(!S.pen||S.pen==="eraser")penStart(S.pen==="eraser"?"marker":S.pen||"marker");else penStart(S.pen);penPicker()});
 p.querySelector(".gfk-own input").onchange=e=>{S.penCol=e.target.value;penStart(S.pen&&S.pen!=="eraser"?S.pen:"marker");penPicker()};
 p.querySelector('[data-act="undo"]').onclick=()=>{K().ink.pop();save();render()};
 p.querySelector('[data-act="clear"]').onclick=()=>{if(!K().ink.length)return;if(confirm("Clear all your drawings?")){K().ink=[];save();render()}};
 const st=p.querySelector('[data-act="stop"]');if(st)st.onclick=()=>{penStop();closePanels()}}
let cap=null;
function capture(on,cursor,handlers){if(cap){cap.remove();cap=null}if(!on)return;const h=host();if(!h)return;cap=document.createElement("div");cap.className="gfk-cap";cap.style.cursor=cursor||"crosshair";h.appendChild(cap);
 cap.addEventListener("pointerdown",e=>{if(e.button)return;e.preventDefault();e.stopPropagation();cap.setPointerCapture(e.pointerId);handlers.down&&handlers.down(e)});
 cap.addEventListener("pointermove",e=>{handlers.move&&handlers.move(e)});cap.addEventListener("pointerup",e=>{handlers.up&&handlers.up(e)});
 cap.addEventListener("wheel",e=>{/* let the map still zoom underneath */if(e.ctrlKey)e.preventDefault();cap.style.pointerEvents="none";setTimeout(()=>{if(cap)cap.style.pointerEvents=""},350)},{passive:false})}
function penStart(id){S.pen=id;S.dragging=false;pinArm(false);sync();
 capture(true,id==="eraser"?"cell":cursorFor(id,S.penCol),{
  down:e=>{const ll=toLL(e.clientX,e.clientY);if(S.pen==="eraser"){erase(e);S.erasing=true;return}if(!ll)return;S.stroke={t:S.pen,c:S.pen==="pencil"&&S.penCol==="#1d1b18"?"#4a4a48":S.penCol,p:[ll.map(v=>+v.toFixed(3))],sx:e.clientX,sy:e.clientY};render()},
  move:e=>{if(S.erasing){erase(e);return}const s=S.stroke;if(!s)return;if(Math.hypot(e.clientX-s.sx,e.clientY-s.sy)<2.5)return;const ll=toLL(e.clientX,e.clientY);if(!ll)return;s.sx=e.clientX;s.sy=e.clientY;s.p.push(ll.map(v=>+v.toFixed(3)));render()},
  up:()=>{S.erasing=false;const s=S.stroke;S.stroke=null;if(s&&s.p.length>1){const k=K();k.ink.push({t:s.t,c:s.c,p:s.p});if(k.ink.length>400)k.ink.shift();save()}render()}})}
function erase(e){const k=K();const before=k.ink.length;k.ink=k.ink.filter(s=>!s.p.some(ll=>{const q=toScreen(ll);return q&&Math.hypot(q[0]-e.clientX,q[1]-e.clientY)<12}));if(k.ink.length!==before){save();render()}}
function penStop(){S.pen=null;S.stroke=null;capture(false);sync()}

/* --- pins --- */
function pinArm(on){S.pinArm=on;const h=host();if(h)h.classList.toggle("gfk-pinning",!!on);if(on){S.pen=null;S.dragging=false;capture(false)}sync()}
/* while dropping pins the map still drags and zooms: only a plain click (no movement) puts a pin down */
{let dn=null;const inMap=e=>{const h=host();return h&&h.contains(e.target)&&!(e.target.closest&&e.target.closest(".gfk-tray,.gfk-panel,.gfk-obj,.gfk-gx,.gfk-gall,.map-zoom-controls,.am-tools,button,input,label,.ps-launcher,.flk"))};
 document.addEventListener("pointerdown",e=>{dn=S.pinArm&&!e.button&&inMap(e)?{x:e.clientX,y:e.clientY,t:Date.now()}:null},true);
 document.addEventListener("pointerup",e=>{if(!dn||!S.pinArm)return;const d=dn;dn=null;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>5||Date.now()-d.t>600||!inMap(e))return;if(pinAt(e.clientX,e.clientY)>=0)return;
  const ll=toLL(e.clientX,e.clientY);if(!ll)return;newPin(ll,e.clientX,e.clientY);
  /* the map's own click (country card) should not also fire */
  const stop=c=>{c.stopPropagation();c.stopImmediatePropagation();c.preventDefault();removeEventListener("click",stop,true)};addEventListener("click",stop,true);setTimeout(()=>removeEventListener("click",stop,true),80)},true)}
function pinMenu(){const P=K().pins;const p=panel("gfkPins",'<b class="gfk-ph">Your pins</b><button type="button" class="gfk-big'+(S.pinArm?" on":"")+'" data-arm>'+(S.pinArm?'<span class="gfk-dot"></span>Dropping pins… click the map · <u>Stop</u>':'📍 Start dropping pins')+'</button>'+
 (P.length?'<ul class="gfk-pinlist">'+P.map((q,i)=>`<li><i style="background:${(PINKIND[q.k]||PINKIND.note)[1]}"></i><button type="button" data-go="${i}">${esc(q.n||"Unnamed pin")}<small>${esc((PINKIND[q.k]||PINKIND.note)[0])} · ${llTxt(q.ll)}${q.note?" · "+esc(q.note.slice(0,40)):""}</small></button><button type="button" class="gfk-del" data-del="${i}" aria-label="Remove">×</button></li>`).join("")+"</ul>":'<p class="gfk-hint">No pins yet. Drag a pin out of the tin onto the map, or press the button above and click the map.</p>')+
 '<p class="gfk-hint">Drag a pin on the map to move it, or back into the tin to remove it.</p>');if(!p)return;
 p.querySelector("[data-arm]").onclick=()=>{pinArm(!S.pinArm);pinMenu()};
 p.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{const q=P[+b.dataset.go];closePanels();try{if(onGlobe())amGlobe.lookAt(q.ll[0],q.ll[1],Math.max(2.5,amGlobe.zoom));}catch(e){}setTimeout(()=>{const s=toScreen(q.ll);if(s)editPin(+b.dataset.go,s[0],s[1])},onGlobe()?900:50)});
 p.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{P.splice(+b.dataset.del,1);save();render();pinMenu()})}
/* off land, a pin takes the name of the sea it is in: the smallest named water around it (a gulf before its ocean) */
function seaAt(ll){try{const O=globeOverlays();let best=null,ba=Infinity;(O.seas||[]).forEach(S0=>{if(!S0.poly)return;try{if(!d3.geoContains(S0.poly,ll))return;const a=d3.geoArea(S0.poly);if(a<ba){ba=a;best=S0.n}}catch(e){}});
 if(best)return best;let nd=Infinity;(O.seas||[]).forEach(S0=>{const d=d3.geoDistance(S0.ll,ll);if(d<nd&&(S0.tier||1)<=1){nd=d;best=S0.n}});return nd<.45?best:""}catch(e){return""}}
/* a pin on or right by a city, peak, volcano or waterfall takes its name, then an island, then an island chain: "Name (Country)" */
function placeName(ll,cx,cy,f){try{const cn=c=>(COUNTRY_BY_CODE[c]||{}).n||"",ctry=f?nameOf(f):"",w=n=>n+(ctry&&n!==ctry?" ("+ctry+")":"");
 let best=null,bd=14,bll=null,bcode=null;const pt=(n,p,extra,code)=>{const q=toScreen(p);if(!q)return;const d=Math.hypot(q[0]-cx,q[1]-cy)-(extra||0);if(d<bd){bd=d;best=n;bll=p;bcode=code||null}};
 try{globeOverlays().cities.forEach(c=>pt(c.n,c.ll,c.cap?2:0))}catch(e){}
 (LANDFORMS.items||[]).forEach(it=>{if(it.geom&&it.geom.t==="pt"&&/^(peaks|volcanoes|rivers|islands)$/.test(it.cat))pt(it.name,it.geom.c,2,it.countries&&it.countries[0])});
 if(best){let c=ctry;if(!c&&bcode)c=cn(bcode);if(!c&&bll){try{const g=projFeatures().find(x=>x.geometry&&d3.geoContains(x,bll));if(g)c=nameOf(g)}catch(e){}}return best+(c&&c!==best?" ("+c+")":"")}
 const inP=cat=>{let b=null,ba=Infinity;(LANDFORMS.items||[]).forEach(it=>{if(it.cat!==cat||!it.geom||it.geom.t!=="poly")return;const g={type:"Polygon",coordinates:it.geom.c};try{if(!d3.geoContains(g,ll))return;const a=d3.geoArea(g);if(a<ba&&a<2){ba=a;b=it}}catch(e){}});return b};
 const isl=inP("islands");if(isl)return isl.name+(ctry||isl.countries?" ("+(ctry||cn(isl.countries[0]))+")":"");
 const grp=inP("groups");if(grp)return grp.name+(ctry||grp.countries?" ("+(ctry||cn(grp.countries[0]))+")":"");
 return ctry||seaAt(ll)}catch(e){return f?nameOf(f):seaAt(ll)}}
/* pins with the same automatic name are numbered 1, 2, 3… in the order they were dropped.
   A name you have typed yourself is never changed. */
const DIR8=["north","north-east","east","south-east","south","south-west","west","north-west"];
function bearing(a,b){const R=Math.PI/180,y=Math.sin((b[0]-a[0])*R)*Math.cos(b[1]*R),x=Math.cos(a[1]*R)*Math.sin(b[1]*R)-Math.sin(a[1]*R)*Math.cos(b[1]*R)*Math.cos((b[0]-a[0])*R);return(Math.atan2(y,x)/R+360)%360}
function sameNames(base){const P=K().pins.filter(p=>p.b===base&&p.auto&&p.n.indexOf(base)===0);if(!P.length)return;
 if(P.length===1){P[0].n=base;return}
 P.sort((a,b)=>a.t-b.t).forEach((p,i)=>p.n=base+" "+(i+1))}
const llTxt=ll=>{const f=(v,p,n)=>{const a=Math.abs(v),d=Math.floor(a),m=Math.round((a-d)*60);return(m===60?d+1:d)+"°"+String(m===60?0:m).padStart(2,"0")+"′"+(v>=0?p:n)};return f(ll[1],"N","S")+" "+f(ll[0],"E","W")};
function newPin(ll,cx,cy){if(!ll){toast("Drop the pin on the map");return}const f=countryAt(cx,cy);const P=K().pins;const base=placeName(ll,cx,cy,f);P.push({ll:ll.map(v=>+v.toFixed(3)),n:base,b:base,auto:1,k:"been",note:"",t:Date.now()});sameNames(base);save();render();
 if(!newPin._told){newPin._told=1;toast("Pin dropped. Click a pin to name it or add a note.")}}
function editPin(i,cx,cy){const q=K().pins[i];if(!q)return;const p=panel("gfkPin",'<b class="gfk-ph">Pin</b><label class="gfk-f">Name<input type="text" maxlength="40" value="'+esc(q.n)+'"></label><div class="gfk-ll" title="Latitude, longitude">'+llTxt(q.ll)+'<small>'+q.ll[1].toFixed(4)+', '+q.ll[0].toFixed(4)+'</small></div>'+
 '<div class="gfk-kinds">'+Object.entries(PINKIND).map(([k,[n,c]])=>`<button type="button" data-k="${k}" class="${q.k===k?"on":""}"><i style="background:${c}"></i>${n}</button>`).join("")+'</div>'+
 '<label class="gfk-f">Note<textarea rows="2" maxlength="300">'+esc(q.note)+'</textarea></label><div class="gfk-acts"><button type="button" data-act="del">Remove pin</button><button type="button" data-act="ok" class="pri">Done</button></div>');if(!p)return;
 if(!PPOS.gfkPin){p.style.left=Math.max(8,Math.min(innerWidth-280,cx+18))+"px";p.style.top=Math.max(8,Math.min(innerHeight-300,cy-40))+"px";clampPanel(p)}
 const nm=p.querySelector("input"),nt=p.querySelector("textarea");nm.oninput=()=>{q.n=nm.value;q.auto=0;save();render()};nt.oninput=()=>{q.note=nt.value;save()};
 p.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{q.k=b.dataset.k;p.querySelectorAll("[data-k]").forEach(x=>x.classList.toggle("on",x===b));save();render()});
 p.querySelector('[data-act="del"]').onclick=()=>{const b=q.b;K().pins.splice(i,1);if(b)sameNames(b);save();render();closePanels()};p.querySelector('[data-act="ok"]').onclick=closePanels;setTimeout(()=>nm.focus(),30)}
/* pins on the map: click to edit, drag to move, drag into the tray to remove */
function pinAt(cx,cy){const P=K().pins;let best=-1,bd=10;P.forEach((q,i)=>{const s=toScreen(q.ll);if(!s)return;const d=Math.min(Math.hypot(s[0]-cx,s[1]-20-cy),Math.hypot(s[0]-cx,s[1]-10-cy)*1.3);if(d<bd){bd=d;best=i}});return best}
function ghostAt(cx,cy){const ll=toLL(cx,cy);if(!ll)return-1;for(let i=S.ghosts.length-1;i>=0;i--){try{if(d3.geoContains(ghostGeom(S.ghosts[i]),ll))return i}catch(e){}}return-1}
document.addEventListener("pointerdown",e=>{if(e.button||!host()||S.pen||S.dragging)return;const h=host();if(!h.contains(e.target)||e.target.closest(".gfk-tray,.gfk-panel,.gfk-obj,.map-zoom-controls,button,input,label"))return;
 const pi=pinAt(e.clientX,e.clientY),gi=pi<0?ghostAt(e.clientX,e.clientY):-1;if(pi<0&&gi<0)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const x0=e.clientX,y0=e.clientY;let moved=false;const G=gi>=0?S.ghosts[gi]:null,ll0=toLL(x0,y0),at0=G?G.at.slice():null;
 const mv=ev=>{if(!moved&&Math.hypot(ev.clientX-x0,ev.clientY-y0)<5)return;moved=true;const ll=toLL(ev.clientX,ev.clientY);if(!ll)return;
  if(pi>=0){K().pins[pi].ll=ll.map(v=>+v.toFixed(3))}else{/* move the ghost by the pointer's move on the sphere */const r=d3.geoRotation([-ll0[0],-ll0[1]]),r2=d3.geoRotation([-ll[0],-ll[1]]);G.at=r2.invert(r(at0))}
  if(S.tray)S.tray.classList.toggle("gfk-drop",overTray(ev.clientX,ev.clientY));render()};
 const up=ev=>{removeEventListener("pointermove",mv,true);removeEventListener("pointerup",up,true);if(S.tray)S.tray.classList.remove("gfk-drop");
  if(moved&&overTray(ev.clientX,ev.clientY)){if(pi>=0)K().pins.splice(pi,1);else S.ghosts.splice(gi,1);save();render();return}
  if(pi>=0){save();if(!moved&&!S.pinArm)editPin(pi,ev.clientX,ev.clientY)}else if(!moved&&ev.detail===2){S.ghosts.splice(gi,1);render()}};
 addEventListener("pointermove",mv,true);addEventListener("pointerup",up,true)},true);
["click","mouseup"].forEach(t=>document.addEventListener(t,e=>{const h=host();if(!h||!h.contains(e.target)||S.pen)return;if(e.target.closest&&e.target.closest(".gfk-tray,.gfk-panel,.gfk-obj"))return;if(pinAt(e.clientX,e.clientY)>=0||ghostAt(e.clientX,e.clientY)>=0){e.stopPropagation();e.stopImmediatePropagation()}},true));

/* --- dice --- */
function roll(el,cx,cy){const tr=S.tray&&S.tray.querySelector(".gfk-dice");if(tr){tr.classList.remove("gfk-roll");void tr.offsetWidth;tr.classList.add("gfk-roll")}
 if(cx!=null){const h=host(),hr=h.getBoundingClientRect(),d=document.createElement("div");d.className="gfk-thrown";d.innerHTML=ART.die(uid(),1+Math.floor(Math.random()*6));d.style.left=cx-hr.left+"px";d.style.top=cy-hr.top+"px";h.appendChild(d);setTimeout(()=>d.remove(),1100)}
 setTimeout(()=>{try{if(onGlobe())amGlobe.surprise();else amtDice()}catch(e){console.error(e)}},cx!=null?650:450)}

/* --- country dragger: works like "drag countries" on the Projections page. While it is on, press a country and a copy
   comes off under your finger and follows it; press a copy to move it again; double-click a copy (or drag it into the toolkit) to drop it */
function addGhost(code){let sh=null;try{sh=typeof ptShapeOf==="function"?ptShapeOf(code):null}catch(e){}
 if(!sh){const f=projFeatures().find(x=>x.geometry&&x.properties.c===code);if(!f)return null;sh={geometry:f.geometry,name:nameOf(f)}}
 const home=d3.geoCentroid(sh.geometry);const G={code,home,at:home.slice(),geom:sh.geometry,label:(COUNTRY_BY_CODE[code]||{}).n||sh.name,col:GHOST_COLS[S.ghosts.length%GHOST_COLS.length]};S.ghosts.push(G);return G}
function lift(f){const G=f&&f.properties?addGhost(f.properties.c):null;if(G)render();return G}
function dragOn(on){S.dragging=on;if(on){S.pen=null;S.pinArm=false;let drag=null;
  capture(true,"grab",{
   down:e=>{const ll=toLL(e.clientX,e.clientY);if(!ll)return;let gi=ghostAt(e.clientX,e.clientY),G=gi>=0?S.ghosts[gi]:null;
    if(!G){const f=countryAt(e.clientX,e.clientY);const code=f&&f.properties&&f.properties.c;if(!code||code==="aq"){toast("Press on a country to pick it up");return}G=addGhost(code);if(!G)return}
    drag={G,off:[G.at[0]-ll[0],G.at[1]-ll[1]],t:Date.now()};if(cap)cap.style.cursor="grabbing";render()},
   move:e=>{if(!drag)return;const ll=toLL(e.clientX,e.clientY);if(!ll)return;drag.G.at=[((ll[0]+drag.off[0])+540)%360-180,Math.max(-85,Math.min(85,ll[1]+drag.off[1]))];
    if(S.tray)S.tray.classList.toggle("gfk-drop",overTray(e.clientX,e.clientY));render()},
   up:e=>{if(!drag)return;if(cap)cap.style.cursor="grab";if(S.tray)S.tray.classList.remove("gfk-drop");
    if(overTray(e.clientX,e.clientY)){S.ghosts.splice(S.ghosts.indexOf(drag.G),1)}drag=null;render()}});
  if(cap)cap.addEventListener("dblclick",e=>{const gi=ghostAt(e.clientX,e.clientY);if(gi>=0){S.ghosts.splice(gi,1);render()}});
  toast("Press a country and drag it. Double-click a copy to remove it. Esc to stop.")}
 else if(!S.pen&&!S.pinArm)capture(false);sync()}
function dragPick(){dragOn(!S.dragging)}
/* --- sea level changer --- */
function seaPanel(){let M;try{M=gfMS()}catch(e){return}const v=M.sea||0,mode=typeof allMapsColorMode!=="undefined"?allMapsColorMode:"";const ok=["relief","satellite","elevation"].includes(mode);
 const p=panel("gfkSea",'<b class="gfk-ph">Sea level</b><div class="gfk-sea"><input type="range" min="-130" max="80" step="1" value="'+v+'" orient="vertical" aria-label="Sea level"><div class="gfk-sealab"><b>'+(v===0?"Today":(v>0?"+":"−")+Math.abs(v)+" m")+'</b><button type="button" data-s="70">All ice melted <small>+70 m</small></button><button type="button" data-s="0">Today</button><button type="button" data-s="-120">Last Ice Age <small>−120 m</small></button></div></div>'+
  (ok?'<p class="gfk-hint">Blue shows land the sea would cover; sand shows sea floor that would be dry land.</p>':'<p class="gfk-hint">Sea level shows on the Relief, Satellite and Elevation maps. <button type="button" class="gfk-link" data-relief>Switch to Relief</button></p>'));if(!p)return;
 const set=x=>{M.sea=x;try{gfMSsave()}catch(e){}try{gfMsRefresh()}catch(e){}try{gfMsPanelSync()}catch(e){}try{gfGlobeDirty()}catch(e){}p.querySelector(".gfk-sealab b").textContent=x===0?"Today":(x>0?"+":"−")+Math.abs(x)+" m"};
 const r=p.querySelector("input");r.oninput=()=>{p.querySelector(".gfk-sealab b").textContent=+r.value===0?"Today":(r.value>0?"+":"−")+Math.abs(r.value)+" m"};r.onchange=()=>set(+r.value);
 p.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{r.value=b.dataset.s;set(+b.dataset.s)});
 const rl=p.querySelector("[data-relief]");if(rl)rl.onclick=()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="Relief Map");if(b)b.click();setTimeout(seaPanel,500)}}

/* --- palette: more styles, your own relief colours, recolour any colour of this map --- */
const NEW_STYLES={
 treasure:{name:"Treasure map",land:[[0,"#e9d3a2"],[300,"#dcc08a"],[1200,"#c7a36c"],[3000,"#a98458"],[6000,"#8a6a48"]],sea:[[0,"#cdd5bf"],[-200,"#b9c6b0"],[-4000,"#a3b3a2"],[-8000,"#8fa192"]],flat:"#b9c6b0",coast:"#5a3a1c",coastA:.95,shadow:[70,40,15],light:[255,240,205],st:1},
 pirate:{name:"Pirate chart",land:[[0,"#e2c99a"],[500,"#d4b47e"],[2000,"#b88f5c"],[5000,"#e7d8bc"]],sea:[[0,"#6f9a96"],[-200,"#4f7d7c"],[-4000,"#2e5658"],[-8000,"#1d3c40"]],flat:"#3e6a6a",coast:"#2a1a0c",coastA:1,shadow:[40,25,10],light:[255,236,200],st:1.05},
 watercolour:{name:"Watercolour",land:[[0,"#bcd9a8"],[400,"#d8e3a6"],[1500,"#e8cf9a"],[3500,"#d6a98c"],[6000,"#f6f0ea"]],sea:[[0,"#bfe3ef"],[-200,"#9fd0e6"],[-4000,"#7fb2d6"],[-8000,"#6a9cc8"]],flat:"#9fd0e6",coast:"#5a8aa8",coastA:.4,shadow:[60,80,110],light:[255,252,240],st:.7},
 blueprint:{name:"Blueprint",land:[[0,"#2e5a9e"],[1000,"#3a68ac"],[3000,"#4c7cbe"],[6000,"#9fbbe6"]],sea:[[0,"#1d3f78"],[-4000,"#173566"],[-8000,"#122b55"]],flat:"#173566",coast:"#e8f0ff",coastA:.95,shadow:[8,16,40],light:[200,220,255],st:.8},
 desert:{name:"Sandstone",land:[[0,"#efd9b0"],[600,"#e3bf88"],[2000,"#cd9a62"],[4000,"#a8734a"],[6000,"#f2e6d6"]],sea:[[0,"#a9d3d6"],[-200,"#7fb9c2"],[-4000,"#4f8ea4"],[-8000,"#346f8a"]],flat:"#6aa3b4",coast:"#7a4a22",coastA:.7,shadow:[90,50,20],light:[255,245,220],st:1}};
function addStyles(){try{if(typeof GF_STYLES==="undefined"||GF_STYLES.treasure)return;Object.assign(GF_STYLES,NEW_STYLES);[["treasure","Treasure map"],["pirate","Pirate chart"],["watercolour","Watercolour"],["blueprint","Blueprint"],["desert","Sandstone"]].forEach(x=>GF_STYLE_ORDER.push(x));
 const mine=K().mine;if(mine){GF_STYLES.mine=mine;GF_STYLE_ORDER.push(["mine","My colours"])}}catch(e){console.error(e)}}
addStyles();
{const st=document.createElement("style");st.textContent=Object.keys(NEW_STYLES).concat(["mine"]).map(k=>".gf-ms-swatch.s-"+k+" i{ "+(GF_STYLES[k]?swBg(k):"")+" }").join("\n");document.head.appendChild(st);setInterval(()=>{if(GF_STYLES.mine&&!st._m){st._m=1;st.textContent+="\n.gf-ms-swatch.s-mine i{ "+swBg("mine")+" }"}},1500)}
const MINE_KEYS=[["land",0,"Lowlands"],["land",1,"Hills"],["land",2,"Mountains"],["land",3,"Peaks"],["sea",0,"Shallow sea"],["sea",1,"Ocean"],["sea",2,"Deep ocean"],["coast",null,"Coastline"]];
function curStyle(){try{const s=gfMS().style;return GF_STYLES[s]||GF_STYLES.vintage}catch(e){return null}}
function mineFrom(S0){const L=S0.land,Sd=S0.sea,pick=(A,i,n)=>A[Math.min(A.length-1,Math.round(i*(A.length-1)/(n-1)))][1];
 return{name:"My colours",land:[[0,pick(L,0,4)],[500,pick(L,1,4)],[2500,pick(L,2,4)],[6000,pick(L,3,4)]],sea:[[0,pick(Sd,0,3)],[-1000,pick(Sd,1,3)],[-8000,pick(Sd,2,3)]],flat:pick(Sd,1,3),coast:S0.coast,coastA:S0.coastA||.8,shadow:S0.shadow||[60,50,40],light:S0.light||[255,250,235],st:S0.st||1}}
function applyMine(m){K().mine=m;save();GF_STYLES.mine=m;if(!GF_STYLE_ORDER.some(x=>x[0]==="mine"))GF_STYLE_ORDER.push(["mine","My colours"]);const M=gfMS();M.style="mine";try{gfMSsave()}catch(e){}try{GFL.styleKey=""}catch(e){}try{gfSetStyle("mine")}catch(e){try{gfMsRefresh()}catch(e2){}}try{gfGlobeDirty()}catch(e){}}
const hex=c=>{if(!c)return null;c=String(c).trim();if(c[0]==="#")return c.length===4?"#"+[...c.slice(1)].map(x=>x+x).join(""):c.toLowerCase().slice(0,7);const m=c.match(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?/);if(!m)return null;if(m[4]!=null&&+m[4]===0)return null;return"#"+[m[1],m[2],m[3]].map(v=>(+v).toString(16).padStart(2,"0")).join("")};
const modeKey=()=>{try{const m=allMapsColorMode;const sub=typeof allMapsSubMode!=="undefined"&&allMapsSubMode[m];return m+(sub?"|"+sub:"")}catch(e){return"?"}};
function mapColours(){const svg=svgEl();const cnt=new Map();if(svg)svg.querySelectorAll("path.map-country").forEach(el=>{const o=el.dataset.gfOrig||hex(getComputedStyle(el).fill);if(o)cnt.set(o,(cnt.get(o)||0)+1)});
 const leg=new Map();document.querySelectorAll("#populationLegend [style*=background], #flKey [style*=background]").forEach(el=>{const c=el.dataset.gfOrig||hex(el.style.background||el.style.backgroundColor);const t=(el.closest("label,li,div,span")||el).textContent.trim().replace(/\s*\d[\d,]*$/,"");if(c&&t&&t.length<60&&!leg.has(c))leg.set(c,t)});
 return[...cnt.entries()].sort((a,b)=>b[1]-a[1]).slice(0,16).map(([c,n])=>({c,n,t:leg.get(c)||""}))}
function recolorLegend(R){document.querySelectorAll("#populationLegend [style*=background], #flKey [style*=background]").forEach(el=>{const o=el.dataset.gfOrig||hex(el.style.background||el.style.backgroundColor);if(!o)return;const to=R[o];if(to){el.dataset.gfOrig=o;if(hex(el.style.backgroundColor)!==to)el.style.background=to}else if(el.dataset.gfOrig){el.style.background=el.dataset.gfOrig;delete el.dataset.gfOrig}})}
function recolor(){const R=K().recolor[modeKey()]||{};recolorLegend(R);const svg=svgEl();if(!svg)return;svg.querySelectorAll("path.map-country").forEach(el=>{let o=el.dataset.gfOrig;const cur=hex(getComputedStyle(el).fill);
 if(!o){if(!R[cur])return;o=el.dataset.gfOrig=cur}else if(el.style.getPropertyValue("fill")===""&&cur&&cur!==o&&!R[cur]){o=el.dataset.gfOrig=cur}
 const to=R[o];if(to){if(el.style.getPropertyValue("fill")!==to)el.style.setProperty("fill",to,"important")}else if(el.style.getPropertyPriority("fill")==="important"){el.style.removeProperty("fill");delete el.dataset.gfOrig}})}
setInterval(()=>{try{if(appMode==="allmaps"&&!onGlobe())recolor()}catch(e){}},700);
/* the globe asks the map for each country's fill: swap in the chosen colours */
setInterval(()=>{try{if(typeof amGlobe==="undefined"||!amGlobe||amGlobe._gfkFill)return;const prev=amGlobe.cfg.fill;if(!prev)return;amGlobe._gfkFill=1;amGlobe.cfg.fill=function(){const r=prev.apply(this,arguments);try{const R=K().recolor[modeKey()];if(R&&r){const to=R[hex(r)];if(to)return to}}catch(e){}return r}}catch(e){}},800);
function openPalette(){let M;try{M=gfMS()}catch(e){return}const mode=typeof allMapsColorMode!=="undefined"?allMapsColorMode:"";
 const styles=GF_STYLE_ORDER.map(([k,t])=>`<button type="button" data-st="${k}" class="gfk-sw s-${k}${M.style===k?" on":""}"><i class="gfk-swi" style="${swBg(k)}"></i>${esc(t)}</button>`).join("");
 let h='<b class="gfk-ph">Palette</b>';
 if(mode==="relief"){const cur=GF_STYLES[M.style]?GF_STYLES[M.style]:null;const mine=K().mine||mineFrom(cur||GF_STYLES.vintage);
  h+='<div class="gfk-sec"><small>Map styles</small><div class="gfk-sws">'+styles+'</div></div>'+
   '<div class="gfk-sec"><small>Your own colours <em>(click a colour to change it)</em></small><div class="gfk-mine">'+MINE_KEYS.map(([a,i,n])=>{const v=a==="coast"?mine.coast:mine[a][i][1];return`<label><input type="color" data-mk="${a}|${i}" value="${hex(v)||"#888888"}"><span>${n}</span></label>`}).join("")+'</div>'+
   '<div class="gfk-acts"><button type="button" data-from>Start from the current style</button><button type="button" data-more>Shading, ocean, labels…</button></div></div>'}
 else{const cols=mapColours(),R=K().recolor[modeKey()]||{};
  h+='<div class="gfk-sec"><small>Colours on this map <em>(click one to change it)</em></small>'+(cols.length?'<div class="gfk-mine">'+cols.map(({c,t})=>`<label><input type="color" data-rc="${c}" value="${R[c]||c}"><span>${esc(t||c)}</span></label>`).join("")+'</div><div class="gfk-acts"><button type="button" data-reset>Back to the original colours</button></div>':'<p class="gfk-hint">This map is a picture (satellite, elevation, population or climate), so its colours can\'t be changed one by one. On the Relief map you can pick a style or mix your own colours.</p>')+'</div>'+
  '<div class="gfk-sec"><small>Relief map styles</small><div class="gfk-sws">'+styles+'</div></div>'}
 const p=panel("gfkPal",h,true);if(!p)return;
 p.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{if(mode!=="relief"){const r=document.querySelector('[data-allmaps-mode="relief"]');if(r)r.click()}try{gfSetStyle(b.dataset.st)}catch(e){console.error(e)}setTimeout(openPalette,mode==="relief"?60:600)});
 p.querySelectorAll("[data-mk]").forEach(inp=>inp.onchange=()=>{const m=JSON.parse(JSON.stringify(K().mine||mineFrom(curStyle()||GF_STYLES.vintage)));const[a,i]=inp.dataset.mk.split("|");if(a==="coast")m.coast=inp.value;else m[a][+i][1]=inp.value;if(a==="sea"&&+i===1)m.flat=inp.value;applyMine(m);setTimeout(openPalette,80)});
 const fr=p.querySelector("[data-from]");if(fr)fr.onclick=()=>{applyMine(mineFrom(curStyle()||GF_STYLES.vintage));setTimeout(openPalette,80)};
 const mo=p.querySelector("[data-more]");if(mo)mo.onclick=()=>{closePanels();try{gfMsOpen(null)}catch(e){}};
 p.querySelectorAll("[data-rc]").forEach(inp=>inp.onchange=()=>{const k=K(),mk=modeKey();(k.recolor[mk]=k.recolor[mk]||{})[inp.dataset.rc]=inp.value;save();recolor();redrawGlobe()});
 const rs=p.querySelector("[data-reset]");if(rs)rs.onclick=()=>{delete K().recolor[modeKey()];save();recolor();redrawGlobe();setTimeout(openPalette,50)}}
function swBg(k){const s=GF_STYLES[k];if(!s)return"";const c=[s.sea[Math.min(1,s.sea.length-1)][1],s.land[0][1],s.land[Math.min(2,s.land.length-1)][1],s.land[s.land.length-1][1]];return"background:linear-gradient(115deg,"+c[0]+" 0 30%,"+c[1]+" 30% 55%,"+c[2]+" 55% 80%,"+c[3]+" 80%)"}

/* ================= coordinates switch ================= */
let coordOn=false;
function coordSwitch(){if(document.getElementById("gfCoordToggle"))return;const g=[...document.querySelectorAll("#allMapsView label.switch")].find(l=>/grid/i.test(l.textContent));if(!g)return;
 g.insertAdjacentHTML("afterend",'<label class="switch" title="Latitude and longitude under the pointer"><input type="checkbox" id="gfCoordToggle"><span class="switch-track"><span class="switch-thumb"></span></span><span class="switch-label">Coordinates</span></label>');
 const i=document.getElementById("gfCoordToggle");i.onchange=()=>{coordOn=i.checked;if(!coordOn)document.querySelectorAll(".gfk-coord").forEach(x=>x.remove())}}
const dms=(v,p,n)=>{const a=Math.abs(v),d=Math.floor(a),m=Math.round((a-d)*60);return d+"°"+String(m===60?0:m).padStart(2,"0")+"′"+(v>=0?p:n)};
document.addEventListener("mousemove",e=>{if(!coordOn)return;const h=host();if(!h)return;let c=h.querySelector(":scope > .gfk-coord");if(!h.contains(e.target)){if(c)c.style.opacity="0";return}
 const ll=toLL(e.clientX,e.clientY);if(!c){c=document.createElement("div");c.className="gfk-coord";h.appendChild(c)}c.style.opacity=ll?"1":"0";if(ll)c.innerHTML="<b>"+dms(ll[1],"N","S")+"</b> <b>"+dms(ll[0],"E","W")+"</b><small>"+ll[1].toFixed(3)+", "+ll[0].toFixed(3)+"</small>"},{passive:true});

/* ================= keep it all in place ================= */
function sync(){const h=host();const show=h&&appMode==="allmaps"&&!(typeof ps!=="undefined"&&ps)&&!document.querySelector("#gfDeep:not([hidden])")&&!(typeof proj!=="undefined"&&proj.on);
 if(!show){if(S.tray)S.tray.remove();if(S.pen||S.pinArm||S.dragging){penStop();S.pinArm=false;S.dragging=false}closePanels();Object.values(S.place).forEach(o=>o.el.remove());return}
 if(!S.tray)S.tray=buildTray();if(S.tray.parentNode!==h)h.appendChild(S.tray);
 S.tray.classList.toggle("closed",!S.open);S.tray.querySelector(".gfk-tab").setAttribute("aria-expanded",S.open);
 ["compass","ruler"].forEach(t=>{const sl=S.tray.querySelector(".gfk-"+t);if(sl)sl.classList.toggle("gfk-out",!!S.place[t])});
 const pen=S.tray.querySelector(".gfk-pens");if(pen)pen.classList.toggle("gfk-active",!!S.pen);const pin=S.tray.querySelector(".gfk-pins");if(pin)pin.classList.toggle("gfk-active",!!S.pinArm);const dg=S.tray.querySelector(".gfk-dragger");if(dg)dg.classList.toggle("gfk-active",!!S.dragging);
 if(cap&&cap.parentNode!==h)h.appendChild(cap);h.classList.toggle("gfk-pinning",!!S.pinArm);coordSwitch();placeObjects()}
try{S.open=!K().closed&&innerWidth>640}catch(e){}
let lastKey="";setInterval(()=>{try{sync();const svg=svgEl();const key=(onGlobe()?"g":"f")+"|"+(typeof SPIN!=="undefined"?SPIN.A.dl+"|"+SPIN.A.f.s+"|"+SPIN.A.f.bx:"")+"|"+(svg&&svg.getAttribute("viewBox"))+"|"+(svg&&!svg.querySelector(":scope > g#gfKitLayer"));if(key!==lastKey){lastKey=key;render()}}catch(e){}},400);
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(document.querySelector(".gfk-panel")){if(document.getElementById("gfkPins")&&S.pinArm)pinArm(false);closePanels();return}if(S.pen){penStop();return}if(S.pinArm){pinArm(false);return}if(S.dragging){dragOn(false);return}if(cap){capture(false)}});
/* ================= the map's other panels move freely too ================= */
const FPOS={};
function freeDrag(el,handleSel,key,onDone){if(el._gfkFree)return;el._gfkFree=1;
 el.addEventListener("pointerdown",e=>{const h=e.target.closest&&e.target.closest(handleSel);if(!h||e.button||e.target.closest("button:not(.flk-pill),input,select,a"))return;if(!e.target.closest(".flk-pill"))e.preventDefault();const r=el.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top,x0=e.clientX,y0=e.clientY;let moved=false;
  const mv=ev=>{if(!moved&&Math.hypot(ev.clientX-x0,ev.clientY-y0)<5)return;if(!moved){moved=true;el.classList.add("gfk-moving")}ev.preventDefault();
   const l=Math.max(60-r.width,Math.min(innerWidth-60,ev.clientX-dx)),t=Math.max(4,Math.min(innerHeight-30,ev.clientY-dy));el.style.setProperty("left",l+"px","important");el.style.setProperty("top",t+"px","important");el.style.setProperty("right","auto","important");el.style.setProperty("bottom","auto","important");FPOS[key]=[l,t]};
  const up=ev=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up,true);el.classList.remove("gfk-moving");if(moved){const stop=c=>{c.stopPropagation();c.preventDefault();removeEventListener("click",stop,true)};addEventListener("click",stop,true);setTimeout(()=>removeEventListener("click",stop,true),50);onDone&&onDone()}};
  addEventListener("pointermove",mv);addEventListener("pointerup",up,true)})}
function restore(el,key){const p=FPOS[key];if(!p)return;el.style.setProperty("left",p[0]+"px","important");el.style.setProperty("top",p[1]+"px","important");el.style.setProperty("right","auto","important");el.style.setProperty("bottom","auto","important")}
setInterval(()=>{try{
 /* Map style panel: lifted out of the map onto the page, so it can go anywhere */
 const ms=document.getElementById("gfMsPanel");if(ms&&!ms._gfkFree){const r=ms.getBoundingClientRect();document.body.appendChild(ms);ms.classList.add("gfk-free");ms.style.setProperty("left",r.left+"px","important");ms.style.setProperty("top",Math.max(8,r.top)+"px","important");restore(ms,"ms");freeDrag(ms,".gf-ms-h","ms")}
 if(ms&&appMode!=="allmaps")ms.remove();
 /* the map key (bottom right) */
 const k=document.getElementById("flKey");if(k){freeDrag(k,".flk-h,.flk-pill","key");if(FPOS.key&&!k.style.left)restore(k,"key")}}catch(e){}},300);
window.gfToolkit={cursorFor,S,K,render,toLL,toScreen,putAway,dropTool,openPalette,seaPanel,penPicker,pinMenu,lift};

/* ================= look ================= */
const css=document.createElement("style");css.textContent=`
.gfk-tray{ position:absolute; left:12px; bottom:0; z-index:7; display:flex; flex-direction:column; align-items:flex-start; user-select:none; -webkit-user-select:none; }
.gfk-tab{ border:0; cursor:pointer; margin:0 0 -2px 14px; position:relative; z-index:1; padding:4px 12px 6px; border-radius:9px 9px 0 0; font:800 11px/1 system-ui,sans-serif; letter-spacing:.06em; text-transform:uppercase; color:#fbefd8;
 background:linear-gradient(#8a5a30,#6a4020); box-shadow:inset 0 1px 0 rgba(255,255,255,.25); display:flex; gap:6px; align-items:center; }
.gfk-tab i{ font-style:normal; transition:transform .2s; } .gfk-tray.closed .gfk-tab i{ transform:rotate(180deg); }
.gfk-felt{ display:flex; gap:4px; align-items:flex-end; padding:8px 10px 8px; border-radius:14px 14px 0 0; max-width:min(560px,calc(100vw - 48px)); overflow-x:auto; scrollbar-width:none;
 background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.08),transparent 60%),linear-gradient(#1f4a3a,#173a2d); border:5px solid transparent;
 border-image:repeating-linear-gradient(90deg,#a06a38 0 14px,#8c5a2c 14px 22px,#b07a44 22px 34px) 6; box-shadow:0 8px 22px rgba(30,20,10,.35), inset 0 3px 8px rgba(0,0,0,.45); }
.gfk-felt::-webkit-scrollbar{ display:none; }
.gfk-tray.closed .gfk-felt{ display:none; }
.gfk-slot{ flex:none; position:relative; width:58px; height:64px; padding:2px 2px 14px; border:0; background:none; cursor:grab; border-radius:10px; display:flex; align-items:center; justify-content:center; transition:transform .15s, background .15s; touch-action:none; }
.gfk-slot:hover{ transform:translateY(-3px) rotate(-2deg); background:rgba(255,255,255,.06); }
.gfk-slot .gfk-art{ width:100%; height:100%; filter:drop-shadow(0 2px 2px rgba(0,0,0,.35)); pointer-events:none; }
.gfk-slot.gfk-ruler{ width:96px; } .gfk-slot.gfk-ruler .gfk-art{ height:auto; }
.gfk-slot span{ position:absolute; left:0; right:0; bottom:0; font:700 9.5px/1.1 system-ui,sans-serif; color:#d7e8dc; text-align:center; white-space:nowrap; pointer-events:none; }
.gfk-slot.gfk-out .gfk-art, .gfk-slot.gfk-lifted .gfk-art{ opacity:.18; filter:grayscale(1); }
.gfk-slot.gfk-out::after{ content:""; position:absolute; inset:4px 6px 16px; border:1.5px dashed rgba(215,232,220,.35); border-radius:10px; }
.gfk-slot.gfk-active{ background:rgba(246,200,90,.18); box-shadow:inset 0 0 0 1.5px rgba(246,200,90,.6); }
.gfk-slot.gfk-roll .gfk-art{ animation:gfkRoll .5s ease-out; } @keyframes gfkRoll{ 0%{transform:rotate(0) translateY(0)} 40%{transform:rotate(200deg) translateY(-14px)} 100%{transform:rotate(360deg) translateY(0)} }
.gfk-tray.gfk-drop .gfk-felt{ box-shadow:0 0 0 3px #f6c85a, 0 8px 22px rgba(30,20,10,.35), inset 0 3px 8px rgba(0,0,0,.45); }
.gfk-float{ position:fixed; z-index:99999; pointer-events:none; width:70px; height:70px; transform:translate(-50%,-50%) rotate(-8deg) scale(1.15); filter:drop-shadow(0 14px 14px rgba(0,0,0,.35)); transition:transform .12s; }
.gfk-float.gfk-f-ruler{ width:150px; height:34px; } .gfk-float .gfk-art{ width:100%; height:100%; }
.gfk-float.gfk-home{ transform:translate(-50%,-50%) scale(.85); opacity:.75; }
.gfk-obj{ position:absolute; z-index:6; width:110px; height:110px; transform:translate(-50%,-50%); cursor:grab; touch-action:none; filter:drop-shadow(0 8px 10px rgba(0,0,0,.3)); }
.gfk-obj .gfk-art{ width:100%; height:100%; pointer-events:none; }
.gfk-obj.gfk-o-ruler{ width:260px; height:52px; transform:translate(-50%,-50%) rotate(-4deg); }
.gfk-obj.gfk-held{ cursor:grabbing; filter:drop-shadow(0 16px 16px rgba(0,0,0,.35)); } .gfk-obj.gfk-home{ opacity:.6; }
.gfk-cpos{ position:absolute; left:50%; top:100%; transform:translate(-50%,2px); white-space:nowrap; font:800 10.5px/1 Georgia,serif; color:#3a2a16; background:rgba(250,240,215,.92); padding:3px 7px; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,.2); }
.gfk-thrown{ position:absolute; z-index:8; width:64px; height:64px; transform:translate(-50%,-50%); pointer-events:none; animation:gfkThrow 1.05s ease-out forwards; }
.gfk-thrown .gfk-art{ width:100%; height:100%; } @keyframes gfkThrow{ 0%{transform:translate(-50%,-160%) rotate(-140deg) scale(1.3)} 45%{transform:translate(-50%,-50%) rotate(30deg) scale(1)} 65%{transform:translate(-50%,-75%) rotate(80deg)} 85%{transform:translate(-50%,-50%) rotate(90deg); opacity:1} 100%{transform:translate(-50%,-50%) rotate(90deg); opacity:0} }
.gfk-cap{ position:absolute; inset:0; z-index:5; touch-action:none; }
.gfk-pinning, .gfk-pinning svg, .gfk-pinning canvas, .gfk-pinning path{ cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='32' viewBox='0 0 30 44'%3E%3Cline x1='15' y1='16' x2='15' y2='42' stroke='%239aa2ab' stroke-width='2'/%3E%3Ccircle cx='15' cy='11' r='9' fill='%23d8322a'/%3E%3Ccircle cx='12' cy='8' r='3' fill='%23fff' opacity='.7'/%3E%3C/svg%3E") 11 31, crosshair !important; }
.gfk-panel{ position:fixed; z-index:9500; width:300px; max-height:calc(100vh - 24px); overflow:auto; padding:6px 14px 12px; border-radius:16px; background:#fffdf8; color:#22324a; box-shadow:0 12px 32px rgba(20,30,50,.28); font:500 13px/1.35 system-ui,sans-serif; }
.gfk-panel.gfk-wide{ width:360px; }
.gfk-grip{ display:flex; justify-content:center; padding:2px 0 6px; cursor:grab; touch-action:none; } .gfk-grip i{ width:38px; height:4px; border-radius:2px; background:rgba(22,50,79,.18); }
.gfk-ph{ cursor:grab; touch-action:none; } .gfk-panel.gfk-moving{ cursor:grabbing; box-shadow:0 20px 44px rgba(20,30,50,.35); } .gfk-panel.gfk-moving *{ cursor:grabbing; }
.gfk-px{ position:absolute; right:8px; top:10px; border:0; background:none; font-size:20px; line-height:1; color:rgba(22,50,79,.45); cursor:pointer; padding:4px; }
.gfk-ph{ display:block; font-size:15px; margin:0 0 8px; }
.gfk-hint{ font-size:11.5px; opacity:.7; margin:8px 0 0; }
.gfk-penrow{ display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
.gfk-pen{ border:0; background:#f3efe6; border-radius:10px; padding:4px 2px 3px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:2px; font:700 9px/1.1 system-ui; color:#3a4a5a; }
.gfk-pen .gfk-art{ width:22px; height:70px; } .gfk-pen.on{ background:#fff1c9; box-shadow:inset 0 0 0 2px #e8b828; }
.gfk-inks{ display:flex; flex-wrap:wrap; gap:6px; margin:10px 0 4px; }
.gfk-inks button{ width:22px; height:22px; border-radius:50%; border:2px solid #fff; background:var(--c); box-shadow:0 0 0 1px rgba(0,0,0,.2); cursor:pointer; } .gfk-inks button.on{ box-shadow:0 0 0 2.5px #1d3550; }
.gfk-own{ width:22px; height:22px; border-radius:50%; overflow:hidden; background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red); box-shadow:0 0 0 1px rgba(0,0,0,.2); cursor:pointer; } .gfk-own input{ opacity:0; width:100%; height:100%; cursor:pointer; }
.gfk-acts{ display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
.gfk-acts button, .gfk-big, .gfk-link{ border:1px solid rgba(22,50,79,.18); background:#fff; border-radius:999px; padding:6px 12px; font:700 12px/1.1 system-ui; color:#22324a; cursor:pointer; }
.gfk-acts button.pri{ background:#2f6f8f; color:#fff; border-color:#2f6f8f; }
.gfk-big{ width:100%; padding:11px; margin-bottom:6px; background:#d8322a; color:#fff; border-color:#b8261f; font-size:13.5px; box-shadow:0 3px 10px rgba(216,50,42,.3); }
.gfk-big:hover{ background:#c42b24; } .gfk-big.on{ background:#fff3f2; color:#b8261f; border:1.5px solid #d8322a; box-shadow:none; }
.gfk-big u{ margin-left:4px; } .gfk-dot{ display:inline-block; width:8px; height:8px; border-radius:50%; background:#d8322a; margin-right:7px; vertical-align:1px; animation:gfkPulse 1s ease-in-out infinite; }
@keyframes gfkPulse{ 50%{ opacity:.25 } }
.gfk-link{ padding:3px 9px; }
.gfk-pinlist{ list-style:none; margin:4px 0 0; padding:0; max-height:220px; overflow:auto; }
.gfk-pinlist li{ display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid rgba(0,0,0,.06); }
.gfk-pinlist i{ width:12px; height:12px; border-radius:50%; flex:none; box-shadow:inset -2px -2px 3px rgba(0,0,0,.25); }
.gfk-pinlist [data-go]{ flex:1; text-align:left; border:0; background:none; font:700 13px system-ui; color:#22324a; cursor:pointer; padding:0; } .gfk-pinlist small{ display:block; font-weight:500; font-size:11px; opacity:.65; }
.gfk-del{ border:0; background:none; font-size:18px; color:rgba(22,50,79,.4); cursor:pointer; }
.gfk-f{ display:block; font-size:11.5px; font-weight:700; color:#56677a; margin:6px 0; } .gfk-f input, .gfk-f textarea{ display:block; width:100%; box-sizing:border-box; margin-top:3px; border:1px solid rgba(22,50,79,.2); border-radius:8px; padding:6px 8px; font:500 13px system-ui; color:#22324a; resize:vertical; }
.gfk-ll{ font:700 12.5px "JetBrains Mono",ui-monospace,monospace; color:#3a5068; margin:-2px 0 8px; display:flex; gap:8px; align-items:baseline; } .gfk-ll small{ font-weight:500; opacity:.6; font-size:11px; }
.gfk-kinds{ display:flex; gap:5px; flex-wrap:wrap; } .gfk-kinds button{ border:1px solid rgba(22,50,79,.18); background:#fff; border-radius:999px; padding:5px 10px 5px 7px; font:700 11.5px system-ui; color:#22324a; cursor:pointer; display:flex; align-items:center; gap:5px; }
.gfk-kinds i{ width:10px; height:10px; border-radius:50%; } .gfk-kinds button.on{ background:#eaf3f8; box-shadow:inset 0 0 0 1.5px #2f6f8f; }
.gfk-sea{ display:flex; gap:14px; align-items:stretch; }
.gfk-sea input[type=range]{ writing-mode:vertical-lr; direction:rtl; width:28px; height:170px; accent-color:#2f7fb8; }
.gfk-sealab{ display:flex; flex-direction:column; gap:6px; justify-content:space-between; } .gfk-sealab b{ font-size:20px; }
.gfk-sealab button{ text-align:left; border:1px solid rgba(22,50,79,.15); background:#f6f9fb; border-radius:10px; padding:6px 10px; font:700 12px system-ui; color:#22324a; cursor:pointer; } .gfk-sealab small{ opacity:.6; font-weight:600; }
.gfk-sec{ margin-top:6px; } .gfk-sec > small{ display:block; font:800 10.5px system-ui; letter-spacing:.06em; text-transform:uppercase; color:#6a7a8c; margin:8px 0 6px; } .gfk-sec > small em{ text-transform:none; letter-spacing:0; font-weight:500; }
.gfk-sws{ display:grid; grid-template-columns:repeat(3,1fr); gap:5px; }
.gfk-sw{ border:1.5px solid transparent; background:#f3f6f9; border-radius:10px; padding:4px; font:700 11px system-ui; color:#2a4258; cursor:pointer; display:flex; flex-direction:column; gap:3px; } .gfk-sw.on{ border-color:#2f7fb8; background:#e8f2fa; }
.gfk-swi{ display:block; height:24px; border-radius:6px; box-shadow:inset 0 0 0 1px rgba(0,0,0,.08); }
.gfk-mine{ display:grid; grid-template-columns:1fr 1fr; gap:4px 10px; }
.gfk-mine label{ display:flex; align-items:center; gap:7px; font:600 12px system-ui; cursor:pointer; min-width:0; } .gfk-mine span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.gfk-mine input{ width:30px; height:24px; padding:0; border:1px solid rgba(0,0,0,.15); border-radius:6px; background:none; cursor:pointer; flex:none; }
.gfk-gx{ position:absolute; z-index:7; width:22px; height:22px; margin-left:-11px; border-radius:50%; border:2px solid; background:#fff; font:800 15px/1 system-ui; padding:0; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.25); transform:translateX(38px); }
.gfk-gall{ position:absolute; z-index:7; left:50%; top:14px; transform:translateX(-50%); border:0; border-radius:999px; padding:7px 14px; background:rgba(255,255,255,.95); color:#22324a; font:700 12.5px system-ui; cursor:pointer; box-shadow:0 2px 10px rgba(20,40,70,.18); }
.gfk-toast{ position:absolute; left:50%; top:52px; transform:translate(-50%,-8px); z-index:9; background:rgba(20,30,46,.88); color:#fff; padding:7px 14px; border-radius:999px; font:600 13px system-ui; opacity:0; transition:.2s; pointer-events:none; white-space:nowrap; }
.gfk-toast.on{ opacity:1; transform:translate(-50%,0); }
.gfk-coord{ position:absolute; right:12px; top:12px; z-index:6; background:rgba(255,255,255,.92); color:#1d3550; border-radius:12px; padding:6px 11px; font:600 12px system-ui; box-shadow:0 2px 10px rgba(20,40,70,.15); pointer-events:none; display:flex; flex-direction:column; gap:1px; transition:opacity .15s; }
.gfk-coord b{ font:800 13px "JetBrains Mono",ui-monospace,monospace; } .gfk-coord small{ opacity:.6; font-size:10.5px; }
.globe-host > .gfk-coord{ right:auto; left:12px; }
.gf-ms-panel.gfk-free{ position:fixed !important; right:auto; bottom:auto; z-index:9400; max-height:calc(100vh - 24px) !important; }
.gf-ms-panel.gfk-free .gf-ms-h{ cursor:grab; touch-action:none; } .gf-ms-panel.gfk-free .gf-ms-h::before{ content:""; position:absolute; left:50%; top:5px; width:38px; height:4px; margin-left:-19px; border-radius:2px; background:rgba(22,50,79,.18); }
.gf-ms-panel.gfk-free{ padding-top:16px !important; } .gf-ms-panel.gfk-free .gf-ms-h{ position:relative; }
#flKey .flk-h{ cursor:grab; touch-action:none; } .gfk-moving, .gfk-moving *{ cursor:grabbing !important; user-select:none; }
:is(#allMapsWrap,.map-wrap)[data-gf-style]:not([data-gf-style=""]):not([data-gf-style="bright"]):not([data-gf-style="classic"]) #worldMapSvgAllMaps :is(path.map-lake, path.map-lake-minor):not(:hover):not(.lake-hover){ fill:var(--gf-lake) !important; fill-opacity:1 !important; }
/* the old buttons these tools replace */
#allMapsWrap .am-tools [data-amt="dice"], #allMapsWrap .am-tools [data-amt="measure"], #amDiceTop, #gfMsBtn, .globe-host [data-g="measure"], .globe-host [data-g="dice"]{ display:none !important; }
/* the "click a country" hint moves up out of the tray's way */
#allMapsWrap:has(> .gfk-tray:not(.closed)) > #gfLearn, .globe-host:has(> .gfk-tray:not(.closed)) #gfLearn{ bottom:118px !important; }
#allMapsWrap:has(> .gfk-tray.closed) > #gfLearn, .globe-host:has(> .gfk-tray.closed) #gfLearn{ bottom:36px !important; }
#allMapsWrap:has(> .gfk-tray) > .am-measure{ top:14px !important; bottom:auto !important; }
body.dark-theme .gfk-panel, body.sky-night .gfk-panel{ background:#1d2638; color:#e6edf7; }
@media (max-width:640px){ #allMapsWrap > .gfk-tray, .globe-host > .gfk-tray{ position:relative; left:auto; bottom:auto; margin:8px 0 4px; width:100%; } .gfk-felt{ max-width:100%; } .gfk-slot{ width:48px; height:56px; } .gfk-slot.gfk-ruler{ width:78px; } .gfk-panel, .gfk-panel.gfk-wide{ width:calc(100vw - 24px); } .gfk-obj{ width:84px; height:84px; } .gfk-obj.gfk-o-ruler{ width:190px; height:38px; } }
`;document.head.appendChild(css);
})();
