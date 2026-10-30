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
geometry(u){/* a school geometry tin, open: protractor, set square and a drawing compass */
 return`<svg viewBox="0 0 100 100" class="gfk-art"><defs><linearGradient id="${u}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f6fb5"/><stop offset="1" stop-color="#25467e"/></linearGradient></defs>
 <ellipse cx="50" cy="94" rx="40" ry="4" fill="#000" opacity=".22"/><rect x="8" y="40" width="84" height="50" rx="5" fill="url(#${u}t)" stroke="#183463" stroke-width="1"/><rect x="12" y="44" width="76" height="42" rx="3" fill="#e9eef6"/>
 <path d="M18 80 A24 24 0 0 1 66 80 Z" fill="#cfe6ff" fill-opacity=".85" stroke="#2f6fb0" stroke-width="1"/><path d="M30 80 A12 12 0 0 1 54 80" fill="none" stroke="#2f6fb0" stroke-width=".7"/><g stroke="#2f6fb0" stroke-width=".6">${[...Array(9)].map((_,i)=>{const a=Math.PI*(i/8);return`<line x1="${42-22*Math.cos(a)}" y1="${80-22*Math.sin(a)}" x2="${42-19*Math.cos(a)}" y2="${80-19*Math.sin(a)}"/>`}).join("")}</g>
 <path d="M66 82 L86 82 L86 54 Z" fill="#ffe08a" fill-opacity=".9" stroke="#b08a20" stroke-width="1"/>
 <g transform="rotate(14 60 30)"><line x1="60" y1="6" x2="50" y2="58" stroke="#8a95a0" stroke-width="3" stroke-linecap="round"/><line x1="60" y1="6" x2="72" y2="58" stroke="#8a95a0" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="7" r="4.5" fill="#c8ced4" stroke="#6a737c"/><path d="M71 56 L73 64 L75 56Z" fill="#333"/><path d="M48.5 56 L50 64 L51.5 56Z" fill="#aaa"/></g></svg>`},
shovel(u){/* a garden spade: steel blade, wooden shaft, D-handle */
 return`<svg viewBox="0 0 80 100" class="gfk-art"><defs><linearGradient id="${u}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa4ad"/><stop offset=".45" stop-color="#e3e8ec"/><stop offset="1" stop-color="#7d8790"/></linearGradient><linearGradient id="${u}w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a5713f"/><stop offset=".5" stop-color="#d49a5c"/><stop offset="1" stop-color="#8a5a2e"/></linearGradient></defs>
 <ellipse cx="44" cy="96" rx="22" ry="3" fill="#000" opacity=".2"/>
 <g transform="rotate(-28 40 50)"><path d="M33 6 h14 a6 6 0 0 1 0 0 v8 h-3 v-4 h-8 v4 h-3z" fill="#5b3a1e"/><rect x="37.5" y="12" width="5" height="44" rx="2" fill="url(#${u}w)"/>
 <path d="M30 56 h20 l-1 24 c0 8 -6 13 -9 15 c-3 -2 -9 -7 -9 -15z" fill="url(#${u}s)" stroke="#5e666d" stroke-width="1"/><path d="M36 58 h8 v6 h-8z" fill="#6c757c"/><path d="M33 84 c2 4 4 6 7 8" stroke="#fff" stroke-opacity=".6" stroke-width="1.2" fill="none"/></g></svg>`},
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
function toLL(cx,cy){if(onGlobe()){const r=amGlobe.canvas.getBoundingClientRect(),p=amGlobe.projection(),ll=p.invert([cx-r.left,cy-r.top]);if(!ll||!isFinite(ll[0]))return null;const r0=p.rotate();if(!amGlobe._flat&&d3.geoDistance(ll,[-r0[0],-r0[1]])>Math.PI/2-.01)return null;return ll}return amtToLL(cx,cy)}
function toScreen(ll){if(onGlobe()){const p=amGlobe.projection(),r0=p.rotate();if(!amGlobe._flat&&d3.geoDistance(ll,[-r0[0],-r0[1]])>Math.PI/2-.02)return null;const q=p(ll),r=amGlobe.canvas.getBoundingClientRect();return q?[r.left+q[0],r.top+q[1]]:null}
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
const PINKIND={been:["Been there","#d8322a"],note:["Note","#e8b828"],want:["Want to go","#2f6fd0"],fav:["Favourite","#2e9e5b"],study:["To study","#e0782a"],home:["Home","#7a4fd0"],idea:["Idea","#e0569f"],dark:["Other","#3a3f47"]};
/* each colour's meaning can be retyped; names are saved with the kit */
/* what a pin looks like: the classic pin, a simple formal marker in its colour, or a sticker */
const PIN_LOOKS=[["pin","📍","Pin"],["dot","●","Dot"],["ring","○","Ring"],["sq","■","Square"],["tri","▲","Triangle"],["dia","◆","Diamond"],["x","✕","Cross"]];
const STICKERS=["⭐","❤️","🚩","✅","❌","🏠","☀️","🔥","📷","🍕","🐾","🎓","⚽","🏔️","🌊","✈️"];
function drawLook(ctx,st,col,x,y){/* returns how high the mark stands (for the label) */
 if(!st||st==="pin")return 0;ctx.save();ctx.lineJoin="round";
 if(STICKERS.includes(st)){ctx.fillStyle="#fff";ctx.shadowColor="rgba(0,0,0,.35)";ctx.shadowBlur=4;ctx.shadowOffsetY=1.5;ctx.beginPath();ctx.arc(x,y-11,12,0,7);ctx.fill();ctx.shadowColor="transparent";ctx.font="16px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(st,x,y-10.5);ctx.restore();return 22}
 ctx.fillStyle=col;ctx.strokeStyle="#fff";ctx.lineWidth=2.2;const r=7,cy=y-r;ctx.beginPath();
 if(st==="dot"||st==="ring")ctx.arc(x,cy,r,0,7);else if(st==="sq")ctx.rect(x-r+1,cy-r+1,2*r-2,2*r-2);else if(st==="tri"){ctx.moveTo(x,cy-r-1);ctx.lineTo(x+r+1,cy+r-1);ctx.lineTo(x-r-1,cy+r-1);ctx.closePath()}else if(st==="dia"){ctx.moveTo(x,cy-r-2);ctx.lineTo(x+r,cy);ctx.lineTo(x,cy+r+2);ctx.lineTo(x-r,cy);ctx.closePath()}
 if(st==="x"){ctx.lineCap="round";ctx.strokeStyle="#fff";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x-6,cy-6);ctx.lineTo(x+6,cy+6);ctx.moveTo(x+6,cy-6);ctx.lineTo(x-6,cy+6);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=3;ctx.stroke()}
 else if(st==="ring"){ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=3.2;ctx.beginPath();ctx.arc(x,cy,r-1.5,0,7);ctx.stroke()}else{ctx.fill();ctx.stroke()}ctx.restore();return 16}
const PIN_DEF=Object.fromEntries(Object.entries(PINKIND).map(([k,v])=>[k,v[0]]));
function pinNamesLoad(){try{const N=K().pinNames||{};for(const k in PINKIND)PINKIND[k][0]=N[k]||PIN_DEF[k]}catch(e){}}

/* ================= rendering on the map ================= */
function moveGeom(geom,from,to){const r1=d3.geoRotation([-from[0],-from[1]]),r2=d3.geoRotation([-to[0],-to[1]]);const f=p=>r2.invert(r1(p));
 const ring=R=>R.map(f);return geom.type==="Polygon"?{type:"Polygon",coordinates:geom.coordinates.map(ring)}:{type:"MultiPolygon",coordinates:geom.coordinates.map(P=>P.map(ring))}}
function ghostGeom(g){const key=g.at+"|"+(g.rot||0);if(!g._geo||g._at!==key){let G2=typeof ptMoveGeom==="function"?ptMoveGeom(g.geom,g.home,g.at):moveGeom(g.geom,g.home,g.at);
  /* turn it about its own centre */
  if(g.rot){const r1=d3.geoRotation([-g.at[0],-g.at[1]]),r2=d3.geoRotation([0,0,g.rot]),f=p=>r1.invert(r2(r1(p))),ring=R=>R.map(f);G2=G2.type==="Polygon"?{type:"Polygon",coordinates:G2.coordinates.map(ring)}:{type:"MultiPolygon",coordinates:G2.coordinates.map(P=>P.map(ring))}}
  g._geo=G2;g._at=key}return g._geo}
const GHOST_COLS=["#e8762a","#7a3fb0","#1e8c8a","#c8281c","#2f6fd0","#3a9a4a"];
const dashOf=(s,lw)=>s.d===1?[lw*3.2,lw*2.4]:s.d===2?[.1,lw*2.6]:[];
function penStyle(t){return t==="geoText"?["geoText","",0,1,"round"]:t==="geo"?["geo","",2.6,.95,"round"]:t==="geoDash"?["geoDash","",2,.9,"round"]:PENS.find(p=>p[0]===t)||PENS[0]}
const inkCss=(c,P)=>`fill:none !important;stroke:${c} !important;stroke-width:${P[2]}px !important;stroke-opacity:${P[3]} !important;stroke-linecap:${P[4]} !important;stroke-linejoin:round !important;opacity:1 !important;stroke-dasharray:none !important;filter:none !important;`;
function renderFlat(){const svg=svgEl();if(!svg)return;let g=svg.querySelector(":scope > g#gfKitLayer");if(!g){g=document.createElementNS(NS,"g");g.id="gfKitLayer";g.setAttribute("data-spin","no");svg.appendChild(g)}else if(g.nextElementSibling)svg.appendChild(g);
 const path=flatPath();if(!path)return;const k=unitsPerPx();let h="";
 K().ink.forEach((s,i)=>{const P=penStyle(s.t);if(s.t!=="geoText"){const d=path({type:"LineString",coordinates:s.p});if(!d)return;const fo=s.fo!=null?s.fo:.16;if(s.f&&fo>0){const df=path({type:"Polygon",coordinates:[s.p]});if(df)h+=`<path d="${df}" pointer-events="none" style="fill:${s.c};fill-opacity:${fo};stroke:none"/>`}
  const lw=P[2]*(s.w||1),da=dashOf(s,lw);h+=`<path d="${d}" vector-effect="non-scaling-stroke" pointer-events="none" style="${inkCss(s.c,P).replace(/stroke-width:[^;]*;/,"stroke-width:"+lw+"px !important;").replace("stroke-dasharray:none !important;",da.length?"stroke-dasharray:"+da.join(" ")+" !important;":"stroke-dasharray:none !important;")}${s.d===2?"stroke-linecap:round !important;":""}${s.t==="highlighter"?"mix-blend-mode:multiply;":""}"/>`}
  if(s.tx){const q=amtFromLL(txtAt(s));if(q){const fs=s.fs||13;h+=`<text x="${q[0]}" y="${q[1]}" font-size="${fs*k}" text-anchor="middle" dominant-baseline="middle" font-weight="800" fill="${s.c}" stroke="#fff" stroke-width="${3*k}" paint-order="stroke" pointer-events="none">${esc(s.tx)}</text>`}}});
 {const sl=selDraw();if(sl){const d=path({type:"LineString",coordinates:sl.p});if(d)h+=`<path d="${d}" vector-effect="non-scaling-stroke" pointer-events="none" style="fill:none;stroke:#fff;stroke-opacity:.55;stroke-width:8px"/><path d="${d}" vector-effect="non-scaling-stroke" pointer-events="none" style="fill:none;stroke:${sl.c};stroke-width:3px"/>`;
  handles(sl).forEach(hd=>{const q=amtFromLL(hd.ll);if(q)h+=`<circle cx="${q[0]}" cy="${q[1]}" r="${6.5*k}" pointer-events="none" style="fill:#fff;stroke:${sl.c};stroke-width:${2.5*k}px"/>`})}}
 if(S.stroke&&S.stroke.p.length>1){const P=penStyle(S.stroke.t),d=path({type:"LineString",coordinates:S.stroke.p});if(d)h+=`<path d="${d}" vector-effect="non-scaling-stroke" pointer-events="none" style="${inkCss(S.stroke.c,P)}"/>`}
 S.ghosts.forEach((G,i)=>{const d=path(ghostGeom(G));if(!d)return;const q=amtFromLL(G.at);
  h+=`<g class="gfk-ghost" data-gi="${i}"><path d="${d}" vector-effect="non-scaling-stroke" style="fill:${G.col} !important;fill-opacity:.45 !important;stroke:${G.col} !important;stroke-width:2px !important;stroke-opacity:1 !important;opacity:1 !important;cursor:grab;filter:drop-shadow(0 3px 4px rgba(0,0,0,.25)) !important"/>`+(q&&G.lab!==false?`<text x="${q[0]}" y="${q[1]}" font-size="${12*k}" text-anchor="middle" font-weight="800" fill="#fff" stroke="${G.col}" stroke-width="${3*k}" paint-order="stroke" pointer-events="none">${esc(G.label)}</text>`:"")+`</g>`});
 K().pins.forEach((p,i)=>{const q=amtFromLL(p.ll);if(!q)return;const col=(PINKIND[p.k]||PINKIND.note)[1];
  h+=`<g class="gfk-pin" data-pi="${i}" transform="translate(${q[0]} ${q[1]}) scale(${k})" style="cursor:pointer"><ellipse cx="4" cy="0" rx="5" ry="1.6" fill="#000" opacity=".28"/><line x1="0" y1="-14" x2="1.5" y2="0" stroke="#aeb6bf" stroke-width="1.8"/><circle cx="0" cy="-20" r="7.5" fill="${col}" stroke="rgba(0,0,0,.35)" stroke-width=".8"/><circle cx="-2.4" cy="-22.6" r="2.4" fill="#fff" opacity=".7"/>`+(p.n?`<text x="10" y="-17" font-size="11" font-weight="800" fill="#1d2a3a" stroke="#fff" stroke-width="3" paint-order="stroke">${esc(p.n)}</text>`:"")+`</g>`});
 g.innerHTML=h}
function renderGlobe(ctx,p){const path=d3.geoPath(p,ctx);ctx.save();
 /* lakes take the shallowest sea colour of the chosen map style (the globe paints them a fixed blue) */
 try{const M=gfMS(),Sx=GF_STYLES[M.style],ov=amGlobe.cfg.overlays?amGlobe.cfg.overlays():{};if(Sx&&allMapsColorMode==="relief"&&ov.lakes){const O=globeOverlays(),c=[-amGlobe.rot[0],-amGlobe.rot[1]];
  ctx.fillStyle=Sx.sea[0][1];ctx.strokeStyle="rgba(0,0,0,.18)";ctx.lineWidth=.4;(O.lakes||[]).forEach(L=>{if(L.minor&&!ov.minorLakes&&!window._gfMinorOn)return;if(L.c&&d3.geoDistance(L.c,c)-(L.r||0)>Math.PI/2)return;ctx.beginPath();path(L);ctx.fill();ctx.stroke()})}}catch(e){}
 const strokes=K().ink.concat(S.stroke&&S.stroke.p.length>1?[S.stroke]:[]);
 const r00=p.rotate(),seen=ll=>amGlobe._flat||d3.geoDistance(ll,[-r00[0],-r00[1]])<Math.PI/2-.02;
 strokes.forEach(s=>{const P=penStyle(s.t);if(s.t==="geoText")return;const fo=s.fo!=null?s.fo:.16;if(s.f&&fo>0){ctx.globalAlpha=fo;ctx.fillStyle=s.c;ctx.beginPath();path({type:"Polygon",coordinates:[s.p]});ctx.fill()}const lw=P[2]*(s.w||1);ctx.globalAlpha=P[3];ctx.strokeStyle=s.c;ctx.lineWidth=lw;ctx.lineCap=s.d===2?"round":P[4];ctx.lineJoin="round";ctx.setLineDash(s.t==="geoDash"?[6,5]:dashOf(s,lw));ctx.globalCompositeOperation=s.t==="highlighter"?"multiply":"source-over";ctx.beginPath();path({type:"LineString",coordinates:s.p});ctx.stroke();ctx.setLineDash([]);
  /* arrowheads on straight lines, pointing along the line's last stretch */
  if(s.ar&&s.p.length>2){const n=s.p.length,ends=[[s.p[n-1],s.p[Math.max(0,n-4)]]];if(s.ar===2)ends.push([s.p[0],s.p[Math.min(n-1,3)]]);ctx.fillStyle=s.c;ends.forEach(([tip,bk])=>{if(!seen(tip))return;const a=p(tip),b=p(bk);if(!a||!b)return;const ang=Math.atan2(a[1]-b[1],a[0]-b[0]),L=7+lw*2.6,W=L*.55;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(a[0]-L*Math.cos(ang)+W*Math.sin(ang),a[1]-L*Math.sin(ang)-W*Math.cos(ang));ctx.lineTo(a[0]-L*Math.cos(ang)-W*Math.sin(ang),a[1]-L*Math.sin(ang)+W*Math.cos(ang));ctx.closePath();ctx.fill()})}});
 {selDraws().forEach(sl=>{if(sl.t==="geoText"){const q=sl.g&&p(sl.g.A);if(q&&seen(sl.g.A)){const fs=sl.fs||14;ctx.font="800 "+fs+"px system-ui";const w=ctx.measureText(sl.tx||"Text").width;ctx.globalAlpha=1;ctx.strokeStyle=sl.c;ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.strokeRect(q[0]-w/2-5,q[1]-fs*.75,w+10,fs*1.5);ctx.setLineDash([])}return}ctx.globalAlpha=.55;ctx.strokeStyle="#fff";ctx.lineWidth=8;ctx.lineJoin="round";ctx.beginPath();path({type:"LineString",coordinates:sl.p});ctx.stroke();ctx.globalAlpha=1;ctx.strokeStyle=sl.c;ctx.lineWidth=3;ctx.beginPath();path({type:"LineString",coordinates:sl.p});ctx.stroke()});const sl=selDraw();if(sl){
  const r0=p.rotate();handles(sl).forEach(h=>{if(!amGlobe._flat&&d3.geoDistance(h.ll,[-r0[0],-r0[1]])>Math.PI/2)return;const q=p(h.ll);if(!q)return;ctx.beginPath();ctx.arc(q[0],q[1],6.5,0,7);ctx.fillStyle="#fff";ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle=sl.c;ctx.stroke()})}}
 ctx.globalAlpha=1;strokes.forEach(s=>{if(!s.lab||!s.at)return;const q=p(s.at),r0=p.rotate();if(!q||!isFinite(q[0]))return;if(!amGlobe._flat&&d3.geoDistance(s.at,[-r0[0],-r0[1]])>Math.PI/2)return;ctx.font="800 12px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineWidth=3.5;ctx.strokeStyle="#fff";ctx.strokeText(s.lab,q[0],q[1]);ctx.fillStyle=s.c;ctx.fillText(s.lab,q[0],q[1])});
 /* text on shapes and text boxes */
 strokes.forEach(s=>{if(!s.tx&&s.t!=="geoText")return;const at=txtAt(s);if(!at||!seen(at))return;const q=p(at);if(!q||!isFinite(q[0]))return;const fs=s.fs||(s.t==="geoText"?14:13),dy=s.lab&&s.g&&(s.g.m==="ring"||s.g.m==="compass")?fs+4:0,t=s.tx||(s.t==="geoText"?"Text":"");if(!t)return;ctx.globalAlpha=s.tx?1:.45;ctx.font="800 "+fs+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineWidth=Math.max(3,fs*.28);ctx.strokeStyle="#fff";ctx.lineJoin="round";ctx.strokeText(t,q[0],q[1]+dy);ctx.fillStyle=s.c;ctx.fillText(t,q[0],q[1]+dy)});ctx.globalAlpha=1;
 ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";
 S.ghosts.forEach(G=>{ctx.beginPath();path(ghostGeom(G));ctx.fillStyle=G.col;ctx.globalAlpha=.45;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=G.col;ctx.lineWidth=2;ctx.stroke();const q=p(G.at),r0=p.rotate();if(q&&G.lab!==false&&(amGlobe._flat||d3.geoDistance(G.at,[-r0[0],-r0[1]])<Math.PI/2)){ctx.font="800 12px system-ui";ctx.textAlign="center";ctx.lineWidth=3;ctx.strokeStyle=G.col;ctx.strokeText(G.label,q[0],q[1]);ctx.fillStyle="#fff";ctx.fillText(G.label,q[0],q[1])}});
 const r0=p.rotate();K().pins.forEach(pn=>{if(!amGlobe._flat&&d3.geoDistance(pn.ll,[-r0[0],-r0[1]])>Math.PI/2-.02)return;const q=p(pn.ll);if(!q)return;const col=(PINKIND[pn.k]||PINKIND.note)[1],[x,y]=q;
  const hgt=drawLook(ctx,pn.st,col,x,y);if(!hgt){
  ctx.fillStyle="rgba(0,0,0,.28)";ctx.beginPath();ctx.ellipse(x+4,y,5,1.6,0,0,7);ctx.fill();ctx.strokeStyle="#aeb6bf";ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x+1.5,y);ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-20,7.5,0,7);ctx.fill();ctx.strokeStyle="rgba(0,0,0,.35)";ctx.lineWidth=.8;ctx.stroke();ctx.fillStyle="rgba(255,255,255,.7)";ctx.beginPath();ctx.arc(x-2.4,y-22.6,2.4,0,7);ctx.fill()}
  if(pn.n){const ly=hgt?y-hgt/2-2:y-17;ctx.font="800 11px system-ui";ctx.textAlign="left";ctx.textBaseline="alphabetic";ctx.lineWidth=3;ctx.strokeStyle="#fff";ctx.strokeText(pn.n,x+(hgt?14:10),ly);ctx.fillStyle="#1d2a3a";ctx.fillText(pn.n,x+(hgt?14:10),ly)}});
 ctx.restore()}
if(typeof GlobeView!=="undefined"){const _dm=GlobeView.prototype._drawMeasure;GlobeView.prototype._drawMeasure=function(ctx,p){try{if(typeof amGlobe!=="undefined"&&this===amGlobe)renderGlobe(ctx,p)}catch(e){console.error(e)}return _dm.apply(this,arguments)}}
let rq=0;function render(){if(rq)return;rq=requestAnimationFrame(()=>{rq=0;try{if(onGlobe())redrawGlobe();else renderFlat()}catch(e){console.error(e)}placeObjects();ghostButtons()})}
/* one button puts all the lifted countries back */
function ghostButtons(){const h=host();document.querySelectorAll(".gfk-gx").forEach(x=>{if(!h||x.parentNode!==h||+x.dataset.gi>=S.ghosts.length)x.remove()});let all=h&&h.querySelector(":scope > .gfk-gall");
 if(!h||!S.ghosts.length){if(all)all.remove();return}
 if(!all){all=document.createElement("button");all.type="button";all.className="gfk-gall";all.textContent="Put all countries back";all.addEventListener("pointerdown",e=>e.stopPropagation(),true);all.onclick=e=>{e.stopPropagation();S.ghosts.length=0;render()};h.appendChild(all)}}

/* ================= the tray ================= */
const TOOLS=[["compass","Compass","Drop it on the map: the needle points to north there"],["geometry","Geometry set","Ruler, drawing compass, range rings, straight lines, shapes, and a place's latitude and longitude around the world"],
 ["pens","Pens","Pick a pen and colour, then draw on the map"],["pins","Pins","Drag a pin onto the map, or click the tin and then click the map"],["dice","Dice","Roll for somewhere random"],
 ["palette","Palette","Map colours: styles, your own colours, recolour this map"],["dragger","Country dragger","Turn on, then press any country and drag it to see its true size elsewhere"],["sea","Sea level changer","Raise or lower the sea"],["shovel","Shovel","Dig straight through the Earth, or cut a cross-section of the land"]];
function artFor(t){const u=uid();return t==="compass"?ART.compass(u,0):t==="ruler"?ART.ruler(u):t==="pens"?ART.pencase(u):t==="pins"?ART.pinbox(u):t==="dice"?ART.die(u,5):t==="palette"?ART.palette(u):t==="dragger"?ART.dragger(u):t==="shovel"?ART.shovel(u):t==="geometry"?ART.geometry(u):ART.sea(u)}
function buildTray(){const tr=document.createElement("div");tr.id="gfKit";tr.className="gfk-tray";
 tr.innerHTML='<button type="button" class="gfk-tab" aria-expanded="true" title="Show or hide the toolkit"><span>Toolkit</span><i>▾</i></button><div class="gfk-felt">'+
  TOOLS.map(([id,n,t])=>`<button type="button" class="gfk-slot gfk-${id}" data-tool="${id}" title="${esc(t)}" aria-label="${esc(n)}">${artFor(id)}<span>${esc(n.replace("Country dragger","Dragger").replace("Sea level changer","Sea level"))}</span></button>`).join("")+"</div>";
 /* the map's hover label must not show through the tray */
 const hideTip=()=>document.querySelectorAll(".map-territory-tooltip, .map-tooltip, .globe-tip").forEach(x=>{x.classList.remove("show");x.style.opacity="0"});
 ["mousemove","mouseover","pointermove"].forEach(ev=>tr.addEventListener(ev,e=>{e.stopPropagation();hideTip()}));tr.addEventListener("mouseleave",()=>document.querySelectorAll(".map-territory-tooltip, .map-tooltip, .globe-tip").forEach(x=>x.style.opacity=""));
 tr.querySelector(".gfk-tab").onclick=()=>{S.open=!S.open;if(S.inTour)S.preTour=S.open;else try{K().closed=!S.open;save()}catch(e){}sync()};
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
 /* a surprise: a real compass goes wild near the magnetic poles and is pulled off course over the Kursk anomaly */
 let odd=null;if(ll){const km=(p,q)=>{const r=Math.PI/180,x=Math.sin((q[1]-p[1])*r/2)**2+Math.cos(p[1]*r)*Math.cos(q[1]*r)*Math.sin((q[0]-p[0])*r/2)**2;return 12742*Math.asin(Math.sqrt(x))};
  const M=[[[139.3,85.8],700,"spin","You’re on the magnetic north pole! Magnetic north is straight below, so the needle has no direction to point and swings around"],[[135.9,-63.9],700,"spin","You’re on the magnetic south pole! The needle has no direction to point here, so it swings around"],[[36.5,51.5],250,"pull","Kursk Magnetic Anomaly: huge iron ore beds underground pull the needle away from north"]];
  for(const [at,r,k,t] of M)if(km(ll,at)<r){odd=[k,t];break}}
 o.el.classList.toggle("gfk-odd",!!odd);if(odd){pos.textContent=odd[1];if(odd[0]==="spin")deg=(o.deg||0)+47+Math.random()*30;else deg+=55+Math.sin(performance.now()/300)*25}
 const n=o.el.querySelector(".gfk-needle");if(n){o.deg=o.deg==null?deg:o.deg+((((deg-o.deg)%360)+540)%360-180)*.35;n.setAttribute("transform","rotate("+o.deg.toFixed(1)+" 50 50)")}}
setInterval(()=>{const o=S.place.compass;if(o&&o.el.isConnected)updCompass(o)},60);

/* ================= what each tool does ================= */
const TOOLPANEL={pens:"gfkPens",pins:"gfkPins",palette:"gfkPal",sea:"gfkSea",shovel:"gfkShovel",geometry:"gfkGeo"};
/* closing a tool's window (its ×, Esc, or its icon again) also puts down whatever it was doing */
function allOff(){try{if(HOLES&&HOLES.length)holes([])}catch(e){}S.shovelArm=false;if(S.pen)penStop();if(S.pinArm)pinArm(false);if(S.dragging)dragOn(false);capture(false);try{GEO.sel=-1}catch(e){}render();sync()}
function clickTool(t,el){const h=host();if(!h)return;const r=h.getBoundingClientRect();
 if(TOOLPANEL[t]&&document.getElementById(TOOLPANEL[t])){closePanels();allOff();return}
 if(t==="dragger"&&S.dragging){dragOn(false);closePanels();return}
 if(t==="compass"||t==="ruler"){if(S.place[t])putAway(t);else dropTool(t,r.left+r.width*(t==="compass"?.18:.5),r.top+r.height*(t==="compass"?.55:.8))}
 else if(t==="pens")penPicker();else if(t==="pins")pinMenu();else if(t==="dice")roll(el);else if(t==="palette")openPalette();else if(t==="dragger")dragPick();else if(t==="sea")seaPanel();else if(t==="shovel")shovelOpen();else if(t==="geometry")geoPanel()}
function dropTool(t,cx,cy){if(t==="compass")placeAt("compass",cx,cy);
 else if(t==="ruler"){placeAt("ruler",cx,cy);measure(true)}
 else if(t==="pins")newPin(toLL(cx,cy),cx,cy);
 else if(t==="dice")roll(null,cx,cy);
 else if(t==="dragger"){const f=countryAt(cx,cy);dragOn(true);if(f&&f.properties.c!=="aq")lift(f,toLL(cx,cy))}
 else if(t==="geometry"){geoPanel();const ll=toLL(cx,cy);if(ll&&GEO.mode==="lineup")lineUp(ll)}
 else if(t==="pens")penPicker();else if(t==="palette")openPalette();else if(t==="sea")seaPanel();else if(t==="shovel"){const ll=toLL(cx,cy);if(ll)dig(ll);else shovelPanel()}}
function clickPlaced(t){if(t==="ruler")measure(true)}
function putAway(t){const o=S.place[t];if(o){o.el.remove();delete S.place[t]}if(t==="ruler")measure(false);if(t==="pens")penStop();if(t==="pins")pinArm(false);if(t==="dragger")dragOn(false);sync()}
function measure(on){try{if(onGlobe()){if(!!amGlobe._measure!==on)amGlobe.toggleMeasure()}else amtToggleMeasure(on)}catch(e){}}

/* --- a small floating panel next to the tray --- */
const PPOS={};
function panel(id,html,wide){closePanels(id+"More");const p=document.createElement("div");p.className="gfk-panel"+(wide?" gfk-wide":"");p.id=id;
 p.innerHTML='<div class="gfk-grip" title="Drag to move"><i></i></div><button type="button" class="gfk-px" aria-label="Close">×</button>'+html;document.body.appendChild(p);
 /* where it opens: where it was last left, else just above the toolkit */
 const pos=PPOS[id];if(pos){p.style.left=pos[0]+"px";p.style.top=pos[1]+"px"}else{const t=S.tray&&S.tray.isConnected?S.tray.getBoundingClientRect():null;const left=t?t.left:20,top=(t?t.top:innerHeight-120)-p.offsetHeight-10;p.style.left=Math.max(8,left)+"px";p.style.top=Math.max(8,top)+"px"}
 clampPanel(p);p.querySelector(".gfk-px").onclick=()=>{closePanels();if(id!=="gfkPin"&&id!=="gfkGhost")allOff()};["pointerdown","mousedown","click","wheel","dblclick","keydown"].forEach(t=>p.addEventListener(t,e=>e.stopPropagation()));
 /* drag it by its header (the title line) anywhere on the page */
 p.addEventListener("pointerdown",e=>{if(!e.target.closest(".gfk-grip,.gfk-ph"))return;e.preventDefault();const r=p.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;p.classList.add("gfk-moving");
  const mv=ev=>{p.style.left=ev.clientX-dx+"px";p.style.top=ev.clientY-dy+"px";clampPanel(p)};const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);p.classList.remove("gfk-moving");PPOS[id]=[parseFloat(p.style.left),parseFloat(p.style.top)]};
  addEventListener("pointermove",mv);addEventListener("pointerup",up)});
 return p}
function clampPanel(p){const r=p.getBoundingClientRect();let l=parseFloat(p.style.left)||0,t=parseFloat(p.style.top)||0;l=Math.max(4-r.width+60,Math.min(innerWidth-60,l));t=Math.max(4,Math.min(innerHeight-40,t));p.style.left=l+"px";p.style.top=t+"px"}
function closePanels(keep){document.querySelectorAll(".gfk-panel").forEach(p=>{if(!keep||p.id!==keep)p.remove()})}
function toast(t){const h=host();if(!h)return;let m=h.querySelector(":scope > .gfk-toast");if(!m){m=document.createElement("div");m.className="gfk-toast";h.appendChild(m)}m.textContent=t;m.classList.add("on");clearTimeout(m._t);m._t=setTimeout(()=>m.classList.remove("on"),2600)}

/* --- pens --- */
const QUICK_INKS=["#1d1b18","#2a3f8f","#c8281c","#2f8f3e","#e8762a","#f2d23a"];
function penPicker(){const own=!QUICK_INKS.includes(S.penCol);const p=panel("gfkPens",'<b class="gfk-ph">Pens</b><div class="gfk-penrow">'+PENS.map(([id,n])=>`<button type="button" class="gfk-pen${S.pen===id?" on":""}" data-pen="${id}" title="${n}">${penArt(uid(),id,id==="eraser"?null:S.penCol)}<span>${n}</span></button>`).join("")+'</div>'+
 '<div class="gfk-inks">'+QUICK_INKS.map(c=>`<button type="button" data-ink="${c}" class="${c===S.penCol?"on":""}" style="--c:${c}" aria-label="Colour ${c}"></button>`).join("")+(own?`<button type="button" data-ink="${S.penCol}" class="on" style="--c:${S.penCol}" aria-label="Your colour"></button>`:"")+'</div>'+
 '<div class="gfk-acts"><button type="button" data-act="undo">Undo</button><button type="button" data-act="more" title="More colours, line thickness, clear all">More settings…</button>'+(S.pen?'<button type="button" data-act="stop" class="pri">Put the pen down</button>':"")+'</div>');if(!p)return;
 p.querySelectorAll("[data-pen]").forEach(b=>b.onclick=()=>{penStart(b.dataset.pen);penPicker()});
 p.querySelectorAll("[data-ink]").forEach(b=>b.onclick=()=>penColour(b.dataset.ink));
 p.querySelector('[data-act="undo"]').onclick=()=>{K().ink.pop();save();render()};
 p.querySelector('[data-act="more"]').onclick=()=>{const m=document.getElementById("gfkPensMore");if(m)m.remove();else penMore()};
 const st=p.querySelector('[data-act="stop"]');if(st)st.onclick=()=>{penStop();closePanels()};if(document.getElementById("gfkPensMore"))penMore()}
function penColour(c){S.penCol=c;if(!S.pen||S.pen==="eraser")penStart(S.pen==="eraser"?"marker":S.pen||"marker");else penStart(S.pen);penPicker()}
/* the Pens "More settings" window: every colour, your own colour, how thick the line is, and clearing everything */
function penMore(){const m=morePanel("gfkPensMore","Pen settings",
  '<div class="gfk-sbrow"><span class="gfk-sl">Colour</span></div><div class="gfk-inks">'+INKS.map(c=>`<button type="button" data-ink="${c}" class="${c===S.penCol?"on":""}" style="--c:${c}" aria-label="Colour ${c}"></button>`).join("")+'<label class="gfk-own" title="Any colour"><input type="color" value="'+S.penCol+'"></label></div>'+
  '<div class="gfk-sbrow"><span class="gfk-sl">Thickness</span>'+segH("pw",[[.5,"thin","Thin"],[1,"normal","Normal"],[1.8,"thick","Thick"],[3,"bold","Very thick"]],S.penW||1)+'</div>'+
  '<hr class="gfk-hr"><div class="gfk-sbacts"><button type="button" data-m="clear" class="gfk-del">Clear all drawings</button></div><p class="gfk-hint">Drawings stay on the Earth as you zoom, pan or spin, and are saved.</p>',document.getElementById("gfkPens"));
 m.querySelectorAll("[data-ink]").forEach(b=>b.onclick=()=>penColour(b.dataset.ink));
 m.querySelector(".gfk-own input").onchange=e=>penColour(e.target.value);
 m.querySelectorAll('[data-sg="pw"] button').forEach(b=>b.onclick=()=>{S.penW=+b.dataset.v;try{K().penW=S.penW;save()}catch(e){}penMore()});
 m.querySelector('[data-m="clear"]').onclick=()=>{if(!K().ink.length)return;if(confirm("Clear all your drawings?")){K().ink=[];save();render()}}}
let cap=null;
function capture(on,cursor,handlers){if(cap){cap.remove();cap=null}if(!on)return;const h=host();if(!h)return;cap=document.createElement("div");cap.className="gfk-cap";cap.style.cursor=cursor||"crosshair";h.appendChild(cap);
 cap.addEventListener("pointerdown",e=>{if(e.button)return;e.preventDefault();e.stopPropagation();cap.setPointerCapture(e.pointerId);handlers.down&&handlers.down(e)});
 cap.addEventListener("pointermove",e=>{handlers.move&&handlers.move(e)});cap.addEventListener("pointerup",e=>{handlers.up&&handlers.up(e)});
 cap.addEventListener("wheel",e=>{/* let the map still zoom underneath */if(e.ctrlKey)e.preventDefault();cap.style.pointerEvents="none";setTimeout(()=>{if(cap)cap.style.pointerEvents=""},350)},{passive:false})}
function penStart(id){S.pen=id;S.dragging=false;pinArm(false);sync();
 capture(true,id==="eraser"?"cell":cursorFor(id,S.penCol),{
  down:e=>{const ll=toLL(e.clientX,e.clientY);if(S.pen==="eraser"){erase(e);S.erasing=true;return}if(!ll)return;S.stroke={t:S.pen,c:S.pen==="pencil"&&S.penCol==="#1d1b18"?"#4a4a48":S.penCol,w:S.penW||1,p:[ll.map(v=>+v.toFixed(3))],sx:e.clientX,sy:e.clientY};render()},
  move:e=>{if(S.erasing){erase(e);return}const s=S.stroke;if(!s)return;if(Math.hypot(e.clientX-s.sx,e.clientY-s.sy)<2.5)return;const ll=toLL(e.clientX,e.clientY);if(!ll)return;s.sx=e.clientX;s.sy=e.clientY;s.p.push(ll.map(v=>+v.toFixed(3)));render()},
  up:()=>{S.erasing=false;const s=S.stroke;S.stroke=null;if(s&&s.p.length>1){const k=K();try{hist()}catch(e){}k.ink.push(Object.assign({t:s.t,c:s.c,p:s.p},s.w&&s.w!==1?{w:s.w}:{}));if(k.ink.length>400)k.ink.shift();save()}render()}})}
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
/* the pin box: one pin of each colour up front. Click one to start dropping that colour, another to switch, the same one to stop */
const pinSVG=c=>'<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 31c0 0-9-11.2-9-18a9 9 0 0 1 18 0c0 6.8-9 18-9 18z" fill="'+c+'" stroke="rgba(0,0,0,.35)" stroke-width="1"/><circle cx="12" cy="12.5" r="3.6" fill="#fff" fill-opacity=".85"/></svg>';
function pinMenu(){pinNamesLoad();const P=K().pins,kit=K();const slots=(kit.pinSlots&&kit.pinSlots.length===3?kit.pinSlots:["been","note","want"]).map(k=>PINKIND[k]?k:"been");const cur=S.pinKind||slots[0];
 const p=panel("gfkPins",'<b class="gfk-ph">Your pins</b><div class="gfk-pickpins" role="group" aria-label="Pin colours">'+slots.map((k,si)=>{const[n,c]=PINKIND[k];const on=S.pinArm&&cur===k;return'<div class="gfk-pslot'+(on?" on":"")+'"><button type="button" data-pk="'+k+'" title="'+(on?"Stop dropping":"Drop "+n.toLowerCase()+" pins")+'">'+pinSVG(c)+'</button><input class="gfk-kname" data-kn="'+k+'" value="'+esc(n)+'" maxlength="22" aria-label="What '+esc(n)+' pins mean" title="Type what this colour means"><button type="button" class="gfk-swap" data-swap="'+si+'" title="Swap this pin for another colour" aria-label="Swap colour">⇄</button></div>'}).join("")+'</div><div class="gfk-swaprow" hidden></div>'+'<button type="button" class="gfk-big'+(S.pinArm?" on":"")+'" data-arm>'+(S.pinArm?'<span class="gfk-dot" style="background:'+PINKIND[cur][1]+'"></span>Dropping “'+PINKIND[cur][0]+'” pins… click the map · <u>Stop</u>':'📍 Pick a pin above, or start dropping')+'</button>'+
 (P.length?'<ul class="gfk-pinlist">'+P.map((q,i)=>`<li><i style="background:${(PINKIND[q.k]||PINKIND.note)[1]}"></i><button type="button" data-go="${i}">${esc(q.n||"Unnamed pin")}<small>${esc((PINKIND[q.k]||PINKIND.note)[0])} · ${llTxt(q.ll)}${q.note?" · "+esc(q.note.slice(0,40)):""}</small></button><button type="button" class="gfk-del" data-del="${i}" aria-label="Remove">×</button></li>`).join("")+"</ul>":'<p class="gfk-hint">No pins yet. Drag a pin out of the tin onto the map, or press the button above and click the map.</p>')+
 '<p class="gfk-hint">Drag a pin on the map to move it, or back into the tin to remove it.</p>');if(!p)return;
 p.querySelector("[data-arm]").onclick=()=>{pinArm(!S.pinArm);pinMenu()};
 pinFindUI(p);
 p.querySelectorAll("[data-pk]").forEach(b=>b.onclick=()=>{const k=b.dataset.pk;if(S.pinArm&&cur===k)pinArm(false);else{S.pinKind=k;pinArm(true)}pinMenu()});
 p.querySelectorAll("[data-swap]").forEach(b=>b.onclick=()=>{const si=+b.dataset.swap,row=p.querySelector(".gfk-swaprow");if(!row.hidden&&row.dataset.si==b.dataset.swap){row.hidden=true;return}row.dataset.si=si;row.hidden=false;
  row.innerHTML='<small>Swap '+PINKIND[slots[si]][0].toLowerCase()+' for:</small>'+Object.entries(PINKIND).filter(([k])=>!slots.includes(k)).map(([k,[n,c]])=>'<button type="button" data-to="'+k+'" title="'+n+'">'+pinSVG(c)+"<span>"+n+"</span></button>").join("");
  row.querySelectorAll("[data-to]").forEach(x=>x.onclick=()=>{const ns=slots.slice();const was=ns[si];ns[si]=x.dataset.to;kit.pinSlots=ns;if(S.pinArm&&cur===was)S.pinKind=x.dataset.to;save();pinMenu()})});
 p.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{const q=P[+b.dataset.go];closePanels();try{if(onGlobe())amGlobe.lookAt(q.ll[0],q.ll[1],Math.max(2.5,amGlobe.zoom));}catch(e){}setTimeout(()=>{const s=toScreen(q.ll);if(s)editPin(+b.dataset.go,s[0],s[1])},onGlobe()?900:50)});
 p.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{P.splice(+b.dataset.del,1);save();render();pinMenu()})}
/* off land, a pin takes the name of the sea it is in: the smallest named water around it (a gulf before its ocean) */
function seaAt(ll){try{const O=globeOverlays();let best=null,ba=Infinity;(O.seas||[]).forEach(S0=>{if(!S0.poly)return;try{if(!d3.geoContains(S0.poly,ll))return;const a=d3.geoArea(S0.poly);if(a<ba){ba=a;best=S0.n}}catch(e){}});
 if(best)return best;let nd=Infinity;(O.seas||[]).forEach(S0=>{const d=d3.geoDistance(S0.ll,ll);if(d<nd&&(S0.tier||1)<=1){nd=d;best=S0.n}});return nd<.45?best:""}catch(e){return""}}
/* a pin on or right by a city, peak, volcano or waterfall takes its name, then an island, then an island chain: "Name (Country)" */
function placeName(ll,cx,cy,f){try{const cn=c=>(COUNTRY_BY_CODE[c]||{}).n||"",ctry=f?nameOf(f):"",w=n=>n+(ctry&&n!==ctry?" ("+ctry+")":"");
 let best=null,bd=14,bll=null,bcode=null;const lim=(f?40:8)/6371,pt=(n,p,extra,code)=>{if(d3.geoDistance(ll,p)>lim)return;const q=toScreen(p);if(!q)return;const d=Math.hypot(q[0]-cx,q[1]-cy)-(extra||0);if(d<bd){bd=d;best=n;bll=p;bcode=code||null}};
 if(f)try{globeOverlays().cities.forEach(c=>pt(c.n,c.ll,c.cap?2:0))}catch(e){}
 (LANDFORMS.items||[]).forEach(it=>{if(it.geom&&it.geom.t==="pt"&&/^(peaks|volcanoes|rivers|islands)$/.test(it.cat))pt(it.name,it.geom.c,2,it.countries&&it.countries[0])});
 if(best){let c=ctry;if(!c&&bcode)c=cn(bcode);if(!c&&bll){try{const g=projFeatures().find(x=>x.geometry&&d3.geoContains(x,bll));if(g)c=nameOf(g)}catch(e){}}return best+(c&&c!==best?" ("+c+")":"")}
 const inP=cat=>{let b=null,ba=Infinity;(LANDFORMS.items||[]).forEach(it=>{if(it.cat!==cat||!it.geom||it.geom.t!=="poly")return;const g={type:"Polygon",coordinates:it.geom.c};try{if(!d3.geoContains(g,ll))return;const a=d3.geoArea(g);if(a<ba&&a<2){ba=a;b=it}}catch(e){}});return b};
 const isl=inP("islands");if(isl)return isl.name+(ctry||isl.countries?" ("+(ctry||cn(isl.countries[0]))+")":"");
 const grp=inP("groups");if(grp)return grp.name+(ctry||grp.countries?" ("+(ctry||cn(grp.countries[0]))+")":"");
 if(f){let nc=null,nd=35/6371;try{globeOverlays().cities.forEach(c=>{const d=d3.geoDistance(ll,c.ll);if(d<nd){nd=d;nc=c.n}})}catch(e){}if(nc)return"Near "+nc+(ctry&&nc!==ctry?" ("+ctry+")":"")}
 return ctry||seaAt(ll)}catch(e){return f?nameOf(f):seaAt(ll)}}
/* pins with the same automatic name are numbered 1, 2, 3… in the order they were dropped.
   A name you have typed yourself is never changed. */
const DIR8=["north","north-east","east","south-east","south","south-west","west","north-west"];
function bearing360(a,b){const R=Math.PI/180,y=Math.sin((b[0]-a[0])*R)*Math.cos(b[1]*R),x=Math.cos(a[1]*R)*Math.sin(b[1]*R)-Math.sin(a[1]*R)*Math.cos(b[1]*R)*Math.cos((b[0]-a[0])*R);return(Math.atan2(y,x)/R+360)%360}
function sameNames(base){const P=K().pins.filter(p=>p.b===base&&p.auto&&p.n.indexOf(base)===0);if(!P.length)return;
 if(P.length===1){P[0].n=base;return}
 P.sort((a,b)=>a.t-b.t).forEach((p,i)=>p.n=base+" "+(i+1))}
const llTxt=ll=>{const f=(v,p,n)=>{const a=Math.abs(v),d=Math.floor(a),m=Math.round((a-d)*60);return(m===60?d+1:d)+"°"+String(m===60?0:m).padStart(2,"0")+"′"+(v>=0?p:n)};return f(ll[1],"N","S")+" "+f(ll[0],"E","W")};
/* other names a pin could take, offered as chips in its panel: a landmark nearby, the nearest city, the state or province
   (for countries in States & provinces, added once their shapes have loaded), the country, the sea */
function pinOptions(ll,cx,cy,f,base){const out=[],add=n=>{if(n&&!out.includes(n))out.push(n)};const ctry=f?nameOf(f):"";
 /* landmarks by how close they look on screen (at any zoom), nearest first; the nearest within ~18 px names the pin */
 const near=[];(window.GF_LANDMARKS||[]).forEach(r=>{if(d3.geoDistance(ll,[r[1],r[2]])>.03)return;const q=toScreen([r[1],r[2]]);if(!q)return;const d=Math.hypot(q[0]-cx,q[1]-cy);if(d<60||d3.geoDistance(ll,[r[1],r[2]])<.004)near.push([d,r[0],d3.geoDistance(ll,[r[1],r[2]])*6371])});
 near.sort((a,b)=>a[0]-b[0]);near.slice(0,3).forEach(x=>add(x[1]));/* a landmark names the pin only when the pin is really on it (within about 3 km), not just close on a zoomed-out map */
 const lmk=near.length&&near[0][0]<18&&near[0][2]<3?near[0][1]:null;
 try{let cb=null,cd=Infinity;globeOverlays().cities.forEach(c=>{const d=d3.geoDistance(ll,c.ll);if(d<cd){cd=d;cb=c}});if(cb&&cd<(f?.0063:0))add(cb.n+(ctry&&cb.n!==ctry?" ("+ctry+")":""))}catch(e){}
 add(base);add(ctry);if(!ctry)add(seaAt(ll));if(lmk){out.splice(out.indexOf(lmk),1);out.unshift(lmk)}return{opts:out,lmk}}
function pinProvince(q,f){try{const cc=f&&f.properties&&f.properties.c;if(!cc||!window.gfProvinces||!(gfProvinces.LIST||[]).some(x=>x[0]===cc))return;
 gfProvinces.load(cc).then(d=>{const it=d.items.find(x=>{try{return d3.geoContains(x.g&&x.g.type?{type:"Feature",geometry:x.g}:x.f||x,q.ll)}catch(e){return false}});if(!it)return;const nm=it.n+" ("+(COUNTRY_BY_CODE[cc]||{}).n+")";q.opts=q.opts||[];if(!q.opts.includes(nm)){q.opts.splice(Math.min(q.opts.length,2),0,nm);save()}}).catch(()=>{})}catch(e){}}
function newPin(ll,cx,cy){if(!ll){toast("Drop the pin on the map");return}setTimeout(()=>{try{const P=K().pins,q=P[P.length-1];if(q&&!q.st&&K().pinLook&&K().pinLook!=="pin"){q.st=K().pinLook;save();render()}}catch(e){}},0);const f=countryAt(cx,cy);const P=K().pins;let base=placeName(ll,cx,cy,f);const po=pinOptions(ll,cx,cy,f,base);if(po.lmk)base=po.lmk;
 const q={ll:ll.map(v=>+v.toFixed(3)),n:base,b:base,auto:1,k:S.pinKind||"been",note:"",t:Date.now(),opts:po.opts};P.push(q);sameNames(base);save();render();pinProvince(q,f);
 /* the pin list in the open pins panel shows the new pin straight away */
 if(document.getElementById("gfkPins")&&!document.getElementById("gfkPin"))try{pinMenu()}catch(e){}
 if(!newPin._told){newPin._told=1;toast("Pin dropped. Click a pin to name it or add a note.")}}
/* placing a pin by typing: a place the map search knows (country, city, landmark, peak, sea…) or coordinates */
function parseLL(t){t=String(t).trim();const dms=/(\d+(?:\.\d+)?)\s*°\s*(?:(\d+(?:\.\d+)?)\s*['′]\s*)?(?:(\d+(?:\.\d+)?)\s*["″]\s*)?([NSns])[\s,;]+(\d+(?:\.\d+)?)\s*°\s*(?:(\d+(?:\.\d+)?)\s*['′]\s*)?(?:(\d+(?:\.\d+)?)\s*["″]\s*)?([EWew])/.exec(t);
 if(dms){const v=(d,m,s2)=>+d+(+m||0)/60+(+s2||0)/3600;let la=v(dms[1],dms[2],dms[3]),lo=v(dms[5],dms[6],dms[7]);if(/[Ss]/.test(dms[4]))la=-la;if(/[Ww]/.test(dms[8]))lo=-lo;return[lo,la]}
 const m=/^\s*(-?\d+(?:\.\d+)?)\s*°?\s*([NSns])?\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EWew])?\s*$/.exec(t);if(!m)return null;
 let la=+m[1],lo=+m[3];if(m[2]&&/[Ss]/.test(m[2]))la=-Math.abs(la);if(m[4]&&/[Ww]/.test(m[4]))lo=-Math.abs(lo);if(Math.abs(la)>90||Math.abs(lo)>180)return null;return[lo,la]}
function pinTyped(ll,name){try{flyTo(ll)}catch(e){}setTimeout(()=>{const q0=toScreen(ll);if(!name&&q0){newPin(ll,q0[0],q0[1]);return}
  const P=K().pins,n=name||(q0?placeName(ll,q0[0],q0[1],countryAt(q0[0],q0[1])):"")||llTxt(ll);const q={ll:ll.map(v=>+v.toFixed(3)),n,b:n,auto:name?0:1,k:S.pinKind||"been",note:"",t:Date.now(),opts:[]};P.push(q);save();render();
  try{pinProvince(q,null)}catch(e){}try{pinMenu()}catch(e){}toast("Pinned: "+n)},700)}
function pinFindUI(p){const host=p.querySelector(".gfk-pickpins");if(!host||p.querySelector(".gfk-pinfind"))return;
 host.insertAdjacentHTML("afterend",'<form class="gfk-pinfind" autocomplete="off"><input type="text" placeholder="Type a place, landmark, city or coordinates" aria-label="Place a pin by name or coordinates"><button type="submit">Pin it</button><div class="gfk-pinsug" hidden></div></form>');
 const F=p.querySelector(".gfk-pinfind"),I=F.querySelector("input"),SG=F.querySelector(".gfk-pinsug");let hits=[];
 const label=e=>{const c=e.cat==="countries"?"":({cities:"city",landmarks:"landmark",peaks:"mountain",volcanoes:"volcano",waterfalls:"waterfall",seas:"sea",lakes:"lake",rivers:"river",islands:"island",ranges:"mountains",deserts:"desert"})[e.cat]||e.cat||"";return c};
 I.addEventListener("input",()=>{const t=I.value.trim(),ll=parseLL(t);if(ll){hits=[];SG.innerHTML='<button type="button" data-i="ll">📍 '+esc(llTxt(ll))+'</button>';SG.hidden=false;return}
  hits=t.length>1&&window.gfSearch?gfSearch.find(t).filter(e=>e.ll&&isFinite(e.ll[0])).slice(0,6):[];SG.hidden=!hits.length;
  SG.innerHTML=hits.map((e,i)=>'<button type="button" data-i="'+i+'">'+esc(e.n)+(label(e)?' <small>'+esc(label(e))+'</small>':'')+'</button>').join("");
  SG.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>go(b.dataset.i))});
 const go=i=>{const t=I.value.trim();if(i==="ll"||parseLL(t)){const ll=parseLL(t);if(ll)pinTyped(ll,null);return}const e=hits[+i||0];if(!e){toast("No place found for “"+t+"”");return}pinTyped(e.ll,e.n)};
 F.addEventListener("submit",ev=>{ev.preventDefault();go(0)});I.addEventListener("keydown",ev=>{ev.stopPropagation();if(ev.key==="Enter"){ev.preventDefault();go(0)}})}
/* the country a pin stands in (checked against the map's country shapes) */
function pinCountry(q){try{const F=projFeatures();for(const f of F){if(f.geometry&&d3.geoContains(f,q.ll)){const c=COUNTRY_BY_CODE[String(f.properties.c).toLowerCase()];if(c)return c}}}catch(e){}return null}
function editPin(i,cx,cy){const q=K().pins[i];if(!q)return;const p=panel("gfkPin",'<b class="gfk-ph">Pin</b><label class="gfk-f">Name<input type="text" maxlength="40" value="'+esc(q.n)+'"></label>'+((q.opts||[]).length>1?'<div class="gfk-names">'+q.opts.map(n=>'<button type="button" data-nm="'+esc(n)+'" class="'+(n===q.n?"on":"")+'">'+esc(n)+"</button>").join("")+"</div>":"")+'<div class="gfk-ll" title="Latitude, longitude">'+llTxt(q.ll)+'<small>'+q.ll[1].toFixed(4)+', '+q.ll[0].toFixed(4)+'</small></div>'+
 '<div class="gfk-kinds">'+Object.entries(PINKIND).map(([k,[n,c]])=>`<button type="button" data-k="${k}" class="${q.k===k?"on":""}"><i style="background:${c}"></i>${n}</button>`).join("")+'</div>'+
 '<div class="gfk-looks" title="What the pin looks like">'+PIN_LOOKS.map(([k,g,n])=>'<button type="button" data-lk="'+k+'" title="'+n+'" class="'+((q.st||"pin")===k?"on":"")+'">'+g+'</button>').join("")+'</div><div class="gfk-looks gfk-stk">'+STICKERS.map(e=>'<button type="button" data-lk="'+e+'" class="'+(q.st===e?"on":"")+'">'+e+'</button>').join("")+'</div>'+
 '<label class="gfk-f">Note<textarea rows="2" maxlength="300">'+esc(q.note)+'</textarea></label><div class="gfk-acts"><button type="button" data-act="lineup" title="Draw its latitude and longitude around the world">✛ Line up</button>'+(pinCountry(q)?'<button type="button" data-act="cty">Open '+esc(pinCountry(q).n)+' →</button>':'')+'<button type="button" data-act="del">Remove pin</button><button type="button" data-act="ok" class="pri">Done</button></div>');if(!p)return;
 if(!PPOS.gfkPin){p.style.left=Math.max(8,Math.min(innerWidth-280,cx+18))+"px";p.style.top=Math.max(8,Math.min(innerHeight-300,cy-40))+"px";clampPanel(p)}
 const nm=p.querySelector("input"),nt=p.querySelector("textarea");nm.oninput=()=>{q.n=nm.value;q.auto=0;save();render()};nt.oninput=()=>{q.note=nt.value;save()};
 p.querySelectorAll("[data-nm]").forEach(b=>b.onclick=()=>{q.n=b.dataset.nm;q.auto=0;nm.value=q.n;p.querySelectorAll("[data-nm]").forEach(x=>x.classList.toggle("on",x===b));save();render()});
 p.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{q.k=b.dataset.k;p.querySelectorAll("[data-k]").forEach(x=>x.classList.toggle("on",x===b));save();render()});
 p.querySelectorAll("[data-lk]").forEach(b=>b.onclick=()=>{q.st=b.dataset.lk==="pin"?undefined:b.dataset.lk;K().pinLook=b.dataset.lk;p.querySelectorAll("[data-lk]").forEach(x=>x.classList.toggle("on",x===b));save();render()});
 p.querySelector('[data-act="lineup"]').onclick=()=>{GEO.mode="lineup";geoSave();geoPanel();lineUp(q.ll,q.n||null)};
 {const cb=p.querySelector('[data-act="cty"]');if(cb)cb.onclick=()=>{const c=pinCountry(q);closePanels();if(c)try{openFlagZoom(c)}catch(e){}}}
 p.querySelector('[data-act="del"]').onclick=()=>{const b=q.b;K().pins.splice(i,1);if(b)sameNames(b);save();render();closePanels()};p.querySelector('[data-act="ok"]').onclick=closePanels;setTimeout(()=>nm.focus(),30)}
/* pins on the map: click to edit, drag to move, drag into the tray to remove */
function pinAt(cx,cy){const P=K().pins;let best=-1,bd=10;P.forEach((q,i)=>{const s=toScreen(q.ll);if(!s)return;const d=Math.min(Math.hypot(s[0]-cx,s[1]-20-cy),Math.hypot(s[0]-cx,s[1]-10-cy)*1.3);if(d<bd){bd=d;best=i}});return best}
function ghostAt(cx,cy){if(!S.ghosts.length)return-1;const ll=toLL(cx,cy);if(ll)for(let i=S.ghosts.length-1;i>=0;i--){try{if(d3.geoContains(ghostGeom(S.ghosts[i]),ll))return i}catch(e){}}
 /* a boost for tiny ones (the Maldives, a lone islet): a click within 16 px of a moved piece picks it up */
 let best=-1,bd=16;S.ghosts.forEach((G,i)=>{try{const q=toScreen(G.at);if(!q)return;const d=Math.hypot(q[0]-cx,q[1]-cy);if(d<bd){bd=d;best=i}}catch(e){}});return best}
document.addEventListener("pointerdown",e=>{if(e.button||!host()||S.pen||S.dragging)return;const h=host();if(!h.contains(e.target)||e.target.closest(".gfk-tray,.gfk-panel,.gfk-obj,.map-zoom-controls,button,input,label"))return;
 const pi=pinAt(e.clientX,e.clientY),gi=pi<0?ghostAt(e.clientX,e.clientY):-1;if(pi<0&&gi<0)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const x0=e.clientX,y0=e.clientY;let moved=false;const G=gi>=0?S.ghosts[gi]:null,ll0=toLL(x0,y0),at0=G?G.at.slice():null;
 const mv=ev=>{if(!moved&&Math.hypot(ev.clientX-x0,ev.clientY-y0)<5)return;moved=true;const ll=toLL(ev.clientX,ev.clientY);if(!ll)return;
  if(pi>=0){K().pins[pi].ll=ll.map(v=>+v.toFixed(3))}else{/* move the ghost by the pointer's move on the sphere */const r=d3.geoRotation([-ll0[0],-ll0[1]]),r2=d3.geoRotation([-ll[0],-ll[1]]);G.at=r2.invert(r(at0))}
  if(S.tray)S.tray.classList.toggle("gfk-drop",overTray(ev.clientX,ev.clientY));render()};
 const up=ev=>{removeEventListener("pointermove",mv,true);removeEventListener("pointerup",up,true);if(S.tray)S.tray.classList.remove("gfk-drop");
  if(moved&&overTray(ev.clientX,ev.clientY)){if(pi>=0)K().pins.splice(pi,1);else S.ghosts.splice(gi,1);save();render();return}
  if(pi>=0){save();if(!moved&&!S.pinArm)editPin(pi,ev.clientX,ev.clientY)}else if(moved&&nearHome(G)){putBack(G,true)}else if(!moved){ghostPanel(G,ev.clientX,ev.clientY)}else render()};
 addEventListener("pointermove",mv,true);addEventListener("pointerup",up,true)},true);
["click","mouseup"].forEach(t=>document.addEventListener(t,e=>{const h=host();if(!h||!h.contains(e.target)||S.pen)return;if(e.target.closest&&e.target.closest(".gfk-tray,.gfk-panel,.gfk-obj"))return;if(pinAt(e.clientX,e.clientY)>=0||ghostAt(e.clientX,e.clientY)>=0){e.stopPropagation();e.stopImmediatePropagation()}},true));

/* --- dice --- */
function roll(el,cx,cy){const tr=S.tray&&S.tray.querySelector(".gfk-dice");if(tr){tr.classList.remove("gfk-roll");void tr.offsetWidth;tr.classList.add("gfk-roll")}
 if(cx!=null){const h=host(),hr=h.getBoundingClientRect(),d=document.createElement("div");d.className="gfk-thrown";d.innerHTML=ART.die(uid(),1+Math.floor(Math.random()*6));d.style.left=cx-hr.left+"px";d.style.top=cy-hr.top+"px";h.appendChild(d);setTimeout(()=>d.remove(),1100)}
 setTimeout(()=>{try{if(onGlobe())amGlobe.surprise();else amtDice()}catch(e){console.error(e)}},cx!=null?650:450)}

/* --- country dragger: works like "drag countries" on the Projections page. While it is on, press a country and a copy
   comes off under your finger and follows it; press a copy to move it again; double-click a copy (or drag it into the toolkit) to drop it */
/* a country's far-apart pieces (Alaska, Hawaii, overseas islands) are lifted on their own: the piece you pressed */
const PART_NAMES=[[[-150,63],"Alaska"],[[-157,20.5],"Hawaii"],[[-62,-51.7],"Falklands"],[[55.5,-21],"Réunion"],[[-61,15],"Guadeloupe & Martinique"],[[-149.5,-17.6],"French Polynesia"],[[166,-21.3],"New Caledonia"],[[20,54.7],"Kaliningrad"],[[-16,28.3],"Canary Islands"],[[-25.6,37.8],"Azores"],[[-16.9,32.7],"Madeira"],[[-155,-10],"Pacific islands"]];
function pieces(code){const fs=projFeatures().filter(f=>f.geometry&&String(f.properties.c)===code);let polys=[];fs.forEach(f=>{const g=f.geometry;if(g.type==="Polygon")polys.push(g.coordinates);else if(g.type==="MultiPolygon")polys.push(...g.coordinates)});
 polys=polys.filter(p=>{try{return d3.geoArea({type:"Polygon",coordinates:p})<2*Math.PI}catch(e){return false}});
 /* clusters: polygons within ~10° of a cluster member join it */
 const cl=[];polys.forEach(p=>{const c=d3.geoCentroid({type:"Polygon",coordinates:p});let home=cl.find(k=>k.cs.some(q=>d3.geoDistance(q,c)<.17));if(!home){home={ps:[],cs:[]};cl.push(home)}home.ps.push(p);home.cs.push(c)});
 /* merge clusters that ended up touching */
 for(let i=0;i<cl.length;i++)for(let j=i+1;j<cl.length;j++){if(cl[i].cs.some(a=>cl[j].cs.some(b=>d3.geoDistance(a,b)<.17))){cl[i].ps.push(...cl[j].ps);cl[i].cs.push(...cl[j].cs);cl.splice(j,1);j=i}}
 cl.forEach(k=>{k.g={type:"MultiPolygon",coordinates:k.ps};k.a=d3.geoArea(k.g)});cl.sort((a,b)=>b.a-a.a);return cl}
function addGhost(code,ll){let sh=null,part="";try{const cl=pieces(code);if(cl.length){let k=cl[0];if(ll&&cl.length>1){const hit=cl.find(x=>{try{return d3.geoContains(x.g,ll)}catch(e){return false}})||cl.slice().sort((a,b)=>Math.min(...a.cs.map(c=>d3.geoDistance(c,ll)))-Math.min(...b.cs.map(c=>d3.geoDistance(c,ll))))[0];k=hit}
  const ft=projFeatures().find(x=>String(x.properties.c)===code);sh={geometry:k.g,name:(COUNTRY_BY_CODE[code]||{}).n||(ft&&ft.properties.n)||code};
  if(k!==cl[0]){const c=d3.geoCentroid(k.g);const nm=PART_NAMES.find(([p])=>d3.geoDistance(p,c)<.25);let n=nm?nm[1]:"";
   if(!n)try{const it=(LANDFORMS.items||[]).filter(i=>/^(groups|islands)$/.test(i.cat)&&i.geom&&i.geom.t==="poly").find(i=>d3.geoContains({type:"Polygon",coordinates:i.geom.c},c));if(it)n=it.name}catch(e){}
   part=n||"overseas part"}}}catch(e){console.error(e)}
 if(!sh){try{sh=typeof ptShapeOf==="function"?ptShapeOf(code):null}catch(e){}}
 if(!sh){const f=projFeatures().find(x=>x.geometry&&x.properties.c===code);if(!f)return null;sh={geometry:f.geometry,name:nameOf(f)}}
 if(part)sh.name=part;
 const home=d3.geoCentroid(sh.geometry);const G={code,home,at:home.slice(),geom:sh.geometry,label:part?sh.name:((COUNTRY_BY_CODE[code]||{}).n||sh.name||code),col:GHOST_COLS[S.ghosts.length%GHOST_COLS.length]};S.ghosts.push(G);return G}
function lift(f,ll){const G=f&&f.properties?addGhost(f.properties.c,ll):null;if(G)render();return G}
/* no blocking overlay: pressing a country or a copy picks it up; pressing anywhere else still moves the map */
let gDrag=null;
function dragOn(on){S.dragging=on;const h=host();if(h)h.classList.toggle("gfk-dragmode",!!on);if(on){S.pen=null;S.pinArm=false;capture(false);toast("Press a country and drag it. Drop it back near home, or into the toolkit, to put it back.")}sync()}
{const inMap=e=>{const h=host();return h&&h.contains(e.target)&&!(e.target.closest&&e.target.closest(".gfk-tray,.gfk-panel,.gfk-obj,.gfk-gx,.gfk-gall,.map-zoom-controls,.am-tools,button,input,label,.ps-launcher,.flk,#gfLearn"))};
 document.addEventListener("pointerdown",e=>{if(!S.dragging||e.button||!inMap(e))return;const ll=toLL(e.clientX,e.clientY);if(!ll)return;
  let gi=ghostAt(e.clientX,e.clientY),G=gi>=0?S.ghosts[gi]:null,fresh=false;
  if(!G){const f=countryAt(e.clientX,e.clientY);const code=f&&f.properties&&f.properties.c;if(!code||code==="aq")return;/* not a country: let the map pan */G=addGhost(code,ll);if(!G)return;fresh=true}
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();gDrag={G,off:[G.at[0]-ll[0],G.at[1]-ll[1]],x:e.clientX,y:e.clientY,moved:false};const h=host();if(h)h.classList.add("gfk-grabbing");render()},true);
 document.addEventListener("pointermove",e=>{if(!gDrag)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(Math.hypot(e.clientX-gDrag.x,e.clientY-gDrag.y)>3)gDrag.moved=true;const ll=toLL(e.clientX,e.clientY);if(!ll)return;
  gDrag.G.at=[((ll[0]+gDrag.off[0])+540)%360-180,Math.max(-85,Math.min(85,ll[1]+gDrag.off[1]))];if(S.tray)S.tray.classList.toggle("gfk-drop",overTray(e.clientX,e.clientY));render()},true);
 document.addEventListener("pointerup",e=>{if(!gDrag)return;e.stopPropagation();e.stopImmediatePropagation();const d=gDrag;gDrag=null;const h=host();if(h)h.classList.remove("gfk-grabbing");if(S.tray)S.tray.classList.remove("gfk-drop");
  const stop=c=>{c.stopPropagation();c.stopImmediatePropagation();c.preventDefault();removeEventListener("click",stop,true)};addEventListener("click",stop,true);setTimeout(()=>removeEventListener("click",stop,true),80);
  if(overTray(e.clientX,e.clientY)||(d.moved&&nearHome(d.G))){putBack(d.G,!overTray(e.clientX,e.clientY));return}render();ghostPanel(d.G,e.clientX,e.clientY)},true)}
function dragPick(){dragOn(!S.dragging)}
/* close to home (on screen, or within a few degrees) it clicks back into place */
function nearHome(G){const a=toScreen(G.at),b=toScreen(G.home);if(a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])<28)return true;return d3.geoDistance(G.at,G.home)<.05}
function putBack(G,snap){const i=S.ghosts.indexOf(G);if(i>=0)S.ghosts.splice(i,1);const p=document.getElementById("gfkGhost");if(p&&p._g===G)closePanels();render();if(snap)toast(G.label+" is back home")}
function ghostPanel(G,cx,cy){const p=panel("gfkGhost",'<b class="gfk-ph" style="color:'+G.col+'">'+esc(G.label)+'</b>'+
  '<div class="gfk-rot"><button type="button" data-r="-15" aria-label="Turn left">↺</button><input type="range" min="-180" max="180" step="1" value="'+(G.rot||0)+'" aria-label="Turn"><button type="button" data-r="15" aria-label="Turn right">↻</button><span>'+(G.rot||0)+'°</span></div>'+
  '<label class="gfk-chk"><input type="checkbox"'+(G.lab!==false?" checked":"")+'> Show its name</label>'+
  '<div class="gfk-acts"><button type="button" data-act="straight">Straighten</button><button type="button" data-act="back" class="pri">Put it back</button></div><p class="gfk-hint">Drag it near its home and it clicks back into place.</p>');if(!p)return;p._g=G;
 if(!PPOS.gfkGhost){p.style.left=Math.max(8,Math.min(innerWidth-310,cx+24))+"px";p.style.top=Math.max(8,Math.min(innerHeight-220,cy-60))+"px";clampPanel(p)}
 const r=p.querySelector('input[type=range]'),lab=p.querySelector(".gfk-rot span"),set=v=>{v=((+v+540)%360)-180;G.rot=v;r.value=v;lab.textContent=v+"°";render()};
 r.oninput=()=>set(r.value);p.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>set((G.rot||0)+ +b.dataset.r));
 p.querySelector(".gfk-chk input").onchange=e=>{G.lab=e.target.checked;render()};
 p.querySelector('[data-act="straight"]').onclick=()=>set(0);p.querySelector('[data-act="back"]').onclick=()=>putBack(G,false)}
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

/* ================= GPS: latitude and longitude under the pointer ================= */
/* always there on the map (top centre, clear of the tabs and buttons); a click folds it to a small GPS button and back */
let coordOn=true;try{coordOn=localStorage.getItem("gfGpsOff")!=="1"}catch(e){}
const GPS_ICO='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
function coordSwitch(){const old=document.getElementById("gfCoordToggle");if(old){const l=old.closest("label");if(l)l.remove()}
 const h=host();if(!h)return;let c=h.querySelector(":scope > .gfk-coord");if(c)gpsPlace(c,h);
 if(!c){document.querySelectorAll(".gfk-coord").forEach(x=>x.remove());c=document.createElement("button");c.type="button";c.className="gfk-coord";c.title="GPS: where the pointer is. Click to hide or show";
  ["pointerdown","mousedown","touchstart","dblclick","wheel"].forEach(t=>c.addEventListener(t,e=>e.stopPropagation(),{passive:true}));
  c.onclick=e=>{e.stopPropagation();coordOn=!coordOn;try{localStorage.setItem("gfGpsOff",coordOn?"0":"1")}catch(er){}gpsPaint(c,null)};h.appendChild(c);gpsPaint(c,null)}}
/* the GPS sits in the map's bottom-right corner */
function gpsPlace(c,h){}
function gpsPaint(c,ll){c.classList.toggle("off",!coordOn);if(!coordOn){c.innerHTML=GPS_ICO;return}
 c.innerHTML=GPS_ICO+(ll?"<b>"+dms(ll[1],"N","S")+"</b><b>"+dms(ll[0],"E","W")+"</b><small>"+ll[1].toFixed(3)+", "+ll[0].toFixed(3)+"</small>":"<small>Point at the map</small>")}
const dms=(v,p,n)=>{const a=Math.abs(v),d=Math.floor(a),m=Math.round((a-d)*60);return d+"°"+String(m===60?0:m).padStart(2,"0")+"′"+(v>=0?p:n)};
let gpsRaf=0,gpsXY=null;
document.addEventListener("mousemove",e=>{if(!coordOn)return;gpsXY=[e.clientX,e.clientY,e.target];if(gpsRaf)return;gpsRaf=requestAnimationFrame(()=>{gpsRaf=0;const h=host();if(!h||!gpsXY)return;const c=h.querySelector(":scope > .gfk-coord");if(!c)return;
 const inside=h.contains(gpsXY[2])&&gpsXY[2]!==c&&!c.contains(gpsXY[2]);gpsPaint(c,inside?toLL(gpsXY[0],gpsXY[1]):null)})},{passive:true});

/* ================= keep it all in place ================= */
function sync(){const h=host();const tour=typeof ps!=="undefined"&&!!ps;
 /* during a guided tour the toolkit stays, under the tour card and folded when the tour starts (open in full screen,
    where there is room); it goes back to how it was when the tour ends */
 const fs=document.body.classList.contains("gf-fs");if(tour&&!S.inTour){S.inTour=true;S.preTour=S.open;S.open=fs;S.tourFs=fs}else if(tour&&S.tourFs!==fs){S.tourFs=fs;S.open=fs}else if(!tour&&S.inTour){S.inTour=false;S.open=S.preTour}
 const show=h&&appMode==="allmaps"&&!document.querySelector("#gfDeep:not([hidden])")&&!(typeof proj!=="undefined"&&proj.on);
 if(!show){if(S.tray)S.tray.remove();if(S.pen||S.pinArm||S.dragging){penStop();S.pinArm=false;S.dragging=false}closePanels();Object.values(S.place).forEach(o=>o.el.remove());return}
 if(!S.tray)S.tray=buildTray();if(S.tray.parentNode!==h)h.appendChild(S.tray);
 S.tray.classList.toggle("closed",!S.open);S.tray.querySelector(".gfk-tab").setAttribute("aria-expanded",S.open);
 ["compass","ruler"].forEach(t=>{const sl=S.tray.querySelector(".gfk-"+t);if(sl)sl.classList.toggle("gfk-out",!!S.place[t])});
 const pen=S.tray.querySelector(".gfk-pens");if(pen)pen.classList.toggle("gfk-active",!!S.pen);const pin=S.tray.querySelector(".gfk-pins");if(pin)pin.classList.toggle("gfk-active",!!S.pinArm);const dg=S.tray.querySelector(".gfk-dragger");if(dg)dg.classList.toggle("gfk-active",!!S.dragging);
 if(cap&&cap.parentNode!==h)h.appendChild(cap);h.classList.toggle("gfk-pinning",!!S.pinArm);h.classList.toggle("gfk-dragmode",!!S.dragging);coordSwitch();placeObjects()}
try{S.open=!K().closed&&innerWidth>640}catch(e){}
let lastKey="";setInterval(()=>{try{sync();const svg=svgEl();const key=(onGlobe()?"g":"f")+"|"+(typeof SPIN!=="undefined"?SPIN.A.dl+"|"+SPIN.A.f.s+"|"+SPIN.A.f.bx:"")+"|"+(svg&&svg.getAttribute("viewBox"))+"|"+(svg&&!svg.querySelector(":scope > g#gfKitLayer"));if(key!==lastKey){lastKey=key;render()}}catch(e){}},400);
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(document.querySelector(".gfk-panel")){const own=document.getElementById("gfkPin")||document.getElementById("gfkGhost");closePanels();if(!own)allOff();return}if(S.pen){penStop();return}if(S.pinArm){pinArm(false);return}if(S.dragging){dragOn(false);return}if(cap){capture(false)}});
/* ================= the map's other panels move freely too ================= */
const FPOS={};
function freeDrag(el,handleSel,key,onDone){if(el._gfkFree)return;el._gfkFree=1;
 el.addEventListener("pointerdown",e=>{const h=e.target.closest&&e.target.closest(handleSel);if(!h||e.button||e.target.closest("button:not(.flk-pill),input,select,a"))return;if(!e.target.closest(".flk-pill"))e.preventDefault();const r=el.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top,x0=e.clientX,y0=e.clientY;let moved=false;
  const mv=ev=>{if(!moved&&Math.hypot(ev.clientX-x0,ev.clientY-y0)<5)return;if(!moved){moved=true;el.classList.add("gfk-moving")}ev.preventDefault();
   const l=Math.max(60-r.width,Math.min(innerWidth-60,ev.clientX-dx)),t=Math.max(4,Math.min(innerHeight-30,ev.clientY-dy));if(BR.has(key)){/* held by its bottom-right corner, so it opens up and to the left */const rr=Math.max(0,innerWidth-l-r.width),bb=Math.max(0,innerHeight-t-r.height);place(el,key,[rr,bb]);FPOS[key]=[rr,bb]}else{el.style.setProperty("left",l+"px","important");el.style.setProperty("top",t+"px","important");el.style.setProperty("right","auto","important");el.style.setProperty("bottom","auto","important");FPOS[key]=[l,t]}};
  const up=ev=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up,true);el.classList.remove("gfk-moving");if(moved){const stop=c=>{c.stopPropagation();c.preventDefault();removeEventListener("click",stop,true)};addEventListener("click",stop,true);setTimeout(()=>removeEventListener("click",stop,true),50);onDone&&onDone()}};
  addEventListener("pointermove",mv);addEventListener("pointerup",up,true)})}
const BR=new Set(["keyBR"]);
function place(el,key,p){el.style.setProperty("right",p[0]+"px","important");el.style.setProperty("bottom",p[1]+"px","important");el.style.setProperty("left","auto","important");el.style.setProperty("top","auto","important")}
function restore(el,key){const p=FPOS[key];if(!p)return;if(BR.has(key)){place(el,key,p);return}el.style.setProperty("left",p[0]+"px","important");el.style.setProperty("top",p[1]+"px","important");el.style.setProperty("right","auto","important");el.style.setProperty("bottom","auto","important")}
setInterval(()=>{try{
 /* Map style panel: lifted out of the map onto the page, so it can go anywhere */
 const ms=document.getElementById("gfMsPanel");if(ms&&!ms._gfkFree){const r=ms.getBoundingClientRect();document.body.appendChild(ms);ms.classList.add("gfk-free");ms.style.setProperty("left",r.left+"px","important");ms.style.setProperty("top",Math.max(8,r.top)+"px","important");restore(ms,"ms");freeDrag(ms,".gf-ms-h","ms")}
 if(ms&&appMode!=="allmaps")ms.remove();
 /* the map key (bottom right) */
 const k=document.getElementById("flKey");if(k){freeDrag(k,".flk-h,.flk-pill","keyBR");if(FPOS.keyBR&&!k.style.right)restore(k,"keyBR")}}catch(e){}},300);
window.gfToolkit={cursorFor,S,K,render,toLL,toScreen,putAway,dropTool,openPalette,seaPanel,penPicker,pinMenu,lift};

/* ================= look ================= */
const css=document.createElement("style");css.textContent=`
.gfk-tray{ position:absolute; left:12px; bottom:0; z-index:7; display:flex; flex-direction:column; align-items:flex-start; user-select:none; -webkit-user-select:none; }
.gfk-tab{ border:0; cursor:pointer; margin:0 0 -2px 14px; position:relative; z-index:1; padding:4px 12px 6px; border-radius:9px 9px 0 0; font:800 11px/1 system-ui,sans-serif; letter-spacing:.06em; text-transform:uppercase; color:#fbefd8;
 background:linear-gradient(#8a5a30,#6a4020); box-shadow:inset 0 1px 0 rgba(255,255,255,.25); display:flex; gap:6px; align-items:center; }
.gfk-tab i{ font-style:normal; transition:transform .2s; } .gfk-tray.closed .gfk-tab i{ transform:rotate(180deg); }
.gfk-felt{ display:flex; gap:4px; align-items:flex-end; padding:8px 10px 8px; border-radius:14px 14px 0 0; max-width:min(640px,calc(100vw - 48px)); overflow-x:auto; scrollbar-width:none;
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
.gfk-dragmode svg path.map-country, .gfk-dragmode canvas{ cursor:grab !important; } .gfk-grabbing, .gfk-grabbing *{ cursor:grabbing !important; }
.gfk-pinning, .gfk-pinning svg, .gfk-pinning canvas, .gfk-pinning path{ cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='32' viewBox='0 0 30 44'%3E%3Cline x1='15' y1='16' x2='15' y2='42' stroke='%239aa2ab' stroke-width='2'/%3E%3Ccircle cx='15' cy='11' r='9' fill='%23d8322a'/%3E%3Ccircle cx='12' cy='8' r='3' fill='%23fff' opacity='.7'/%3E%3C/svg%3E") 11 31, crosshair !important; }
.gfk-panel{ position:fixed; z-index:9500; width:300px; max-height:calc(100vh - 24px); overflow:auto; padding:6px 14px 12px; border-radius:16px; background:#fffdf8; color:#22324a; box-shadow:0 12px 32px rgba(20,30,50,.28); font:500 13px/1.35 system-ui,sans-serif; }
.gfk-panel.gfk-wide{ width:360px; }
.gfk-grip{ display:flex; justify-content:center; padding:2px 0 6px; cursor:grab; touch-action:none; } .gfk-grip i{ width:38px; height:4px; border-radius:2px; background:rgba(22,50,79,.18); }
.gfk-ph{ cursor:grab; touch-action:none; } .gfk-panel.gfk-moving{ cursor:grabbing; box-shadow:0 20px 44px rgba(20,30,50,.35); } .gfk-panel.gfk-moving *{ cursor:grabbing; }
.gfk-px{ position:absolute; right:8px; top:8px; width:28px; height:28px; border:0; border-radius:50%; background:rgba(22,50,79,.08); font:600 20px/28px system-ui; text-align:center; color:#22324a; cursor:pointer; padding:0; z-index:2; }
.gfk-px:hover{ background:rgba(22,50,79,.18); }
body.dark-theme .gfk-px, body.sky-night .gfk-px{ background:rgba(255,255,255,.12); color:#e6edf7; } body.dark-theme .gfk-px:hover, body.sky-night .gfk-px:hover{ background:rgba(255,255,255,.24); }
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
.gfk-pslot{ position:relative; display:flex; flex-direction:column; align-items:stretch; min-width:0; } .gfk-pslot > button[data-pk]{ width:100%; } .gfk-pslot.on > button[data-pk]{ background:#eaf3f8; box-shadow:inset 0 0 0 2px #2f6f8f; } .gfk-swap{ position:absolute; top:-6px; right:-6px; width:22px; height:22px; border-radius:50%; border:1px solid rgba(22,50,79,.2); background:#fff; font-size:12px; line-height:1; cursor:pointer; padding:0; box-shadow:0 1px 3px rgba(0,0,0,.15); } .gfk-swap:hover{ background:#eaf3f8; } .gfk-swaprow{ display:flex; flex-wrap:wrap; gap:5px; align-items:center; margin:-2px 0 8px; padding:6px; border-radius:10px; background:rgba(22,50,79,.05); } .gfk-swaprow small{ width:100%; font-size:11.5px; opacity:.7; } .gfk-swaprow button{ display:flex; flex-direction:column; align-items:center; border:1px solid rgba(22,50,79,.16); background:#fff; border-radius:10px; padding:4px 6px; cursor:pointer; font:600 10.5px/1.2 inherit; color:inherit; } .gfk-swaprow svg{ width:16px; height:22px; }
.gfk-pinfind{ position:relative; display:flex; gap:6px; margin:8px 0 4px; } .gfk-pinfind input{ flex:1; min-width:0; padding:8px 10px; border-radius:10px; border:1px solid rgba(22,50,79,.18); font:inherit; font-size:13px; background:#fff; color:#16324f; }
#gfkPins .gfk-pinfind > button{ padding:6px 12px; border-radius:10px; border:0; background:#c0392b; color:#fff; font:700 13px inherit; font-family:inherit; cursor:pointer; }
.gfk-pinsug{ position:absolute; left:0; right:0; top:100%; z-index:5; margin-top:4px; background:#fff; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,.18); overflow:hidden; }
#gfkPins .gfk-pinsug button{ display:block; width:100%; text-align:left; padding:7px 10px; border:0; background:none; font:600 13px inherit; font-family:inherit; color:#16324f; cursor:pointer; } #gfkPins .gfk-pinsug button:hover{ background:#f1f4f8; } .gfk-pinsug small{ opacity:.6; font-weight:600; }
.gfk-pickpins{ display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin:4px 0 8px; } .gfk-pickpins button[data-pk]{ display:flex; flex-direction:column; align-items:center; gap:2px; border:1px solid rgba(22,50,79,.16); background:#fff; border-radius:12px; padding:6px 4px 5px; cursor:pointer; font:600 11.5px/1.2 inherit; color:inherit; } .gfk-pickpins svg{ width:20px; height:27px; transition:transform .15s; } .gfk-pickpins button:hover svg{ transform:translateY(-3px); } .gfk-pickpins button.on{ background:#eaf3f8; box-shadow:inset 0 0 0 2px #2f6f8f; } .gfk-pickpins button.on svg{ transform:translateY(-3px) rotate(-8deg); }
.gfk-names{ display:flex; gap:5px; flex-wrap:wrap; margin:-2px 0 8px; } .gfk-names button{ border:1px dashed rgba(22,50,79,.3); background:#fff; border-radius:999px; padding:3px 9px; font:600 12px/1.3 inherit; cursor:pointer; color:inherit; } .gfk-names button.on{ border-style:solid; background:#eaf3f8; box-shadow:inset 0 0 0 1.5px #2f6f8f; }
.gfk-kinds{ display:flex; gap:5px; flex-wrap:wrap; } .gfk-kinds button{ border:1px solid rgba(22,50,79,.18); background:#fff; border-radius:999px; padding:5px 10px 5px 7px; font:700 11.5px system-ui; color:#22324a; cursor:pointer; display:flex; align-items:center; gap:5px; }
.gfk-kinds i{ width:10px; height:10px; border-radius:50%; } .gfk-kinds button.on{ background:#eaf3f8; box-shadow:inset 0 0 0 1.5px #2f6f8f; }
.gfk-rot{ display:flex; align-items:center; gap:8px; margin:4px 0 8px; } .gfk-rot input{ flex:1; accent-color:#2f6f8f; } .gfk-rot button{ width:30px; height:30px; border-radius:50%; border:1px solid rgba(22,50,79,.2); background:#fff; font-size:16px; cursor:pointer; color:#22324a; } .gfk-rot span{ width:42px; text-align:right; font:700 12px ui-monospace,monospace; color:#56677a; }
.gfk-chk{ display:flex; gap:8px; align-items:center; font:600 13px system-ui; cursor:pointer; margin:4px 0; }
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
.gfk-o-compass.gfk-odd .gfk-cpos{ white-space:normal; width:170px; line-height:1.3; text-align:center; background:#7a2a1a; color:#fff; }
.gfk-gall{ position:absolute; z-index:7; left:50%; top:14px; transform:translateX(-50%); border:0; border-radius:999px; padding:7px 14px; background:rgba(255,255,255,.95); color:#22324a; font:700 12.5px system-ui; cursor:pointer; box-shadow:0 2px 10px rgba(20,40,70,.18); }
.gfk-toast{ position:absolute; left:50%; top:52px; transform:translate(-50%,-8px); z-index:9; background:rgba(20,30,46,.88); color:#fff; padding:7px 14px; border-radius:999px; font:600 13px system-ui; opacity:0; transition:.2s; pointer-events:none; white-space:nowrap; }
.gfk-toast.on{ opacity:1; transform:translate(-50%,0); }
.gfk-coord{ position:absolute; right:12px; bottom:12px; left:auto; top:auto !important; transform:none; z-index:6; display:flex; align-items:center; gap:9px; border:0; cursor:pointer; background:rgba(255,255,255,.92); color:#1d3550; border-radius:999px; padding:5px 12px 5px 9px; font:600 12px system-ui; box-shadow:0 2px 10px rgba(20,40,70,.15); white-space:nowrap; min-height:28px; }
#allMapsWrap > .gfk-coord svg, .globe-host > .gfk-coord svg, .gfk-coord svg{ flex:none; color:#2f8a7a; width:15px !important; height:15px !important; min-width:0 !important; max-width:15px !important; position:static !important; display:block !important; transform:none !important; margin:0 !important; pointer-events:none; }
#allMapsWrap > .gfk-coord, .globe-host > .gfk-coord{ width:auto !important; height:auto !important; }
.gfk-coord b{ font:800 12.5px "JetBrains Mono",ui-monospace,monospace; min-width:5.8em; } .gfk-coord small{ opacity:.6; font-size:10.5px; }
.gfk-coord.off{ padding:5px; min-width:28px; justify-content:center; opacity:.8; }
.gfk-coord:hover{ box-shadow:0 2px 12px rgba(20,40,70,.25); }
body.dark-theme .gfk-coord{ background:rgba(28,38,56,.92); color:#dbe6f2; }
@media (max-width:760px){ .gfk-coord small{ display:none; } .gfk-coord b{ min-width:0; } }
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
/* typing a new meaning under a pin colour */
document.addEventListener("input",e=>{const t=e.target;if(!t.classList||!t.classList.contains("gfk-kname"))return;try{const kit=K(),k=t.dataset.kn,v=t.value.trim();kit.pinNames=kit.pinNames||{};if(v&&v!==PIN_DEF[k])kit.pinNames[k]=v;else delete kit.pinNames[k];PINKIND[k][0]=v||PIN_DEF[k];save();
 document.querySelectorAll('.gfk-pinlist li').forEach(li=>{});clearTimeout(t._r);t._r=setTimeout(()=>{if(document.activeElement!==t){try{pinMenu()}catch(err){}}},800)}catch(err){console.error(err)}},true);
document.addEventListener("change",e=>{const t=e.target;if(t.classList&&t.classList.contains("gfk-kname")){try{pinMenu()}catch(err){}}},true);
document.addEventListener("keydown",e=>{const t=e.target;if(t.classList&&t.classList.contains("gfk-kname")){e.stopPropagation();if(e.key==="Enter")t.blur()}},true);
{const st=document.createElement("style");st.textContent=".gfk-kname{display:block;width:100%;box-sizing:border-box;margin-top:4px;border:1px dashed transparent;background:transparent;border-radius:6px;text-align:center;font:700 12px/1.3 inherit;color:inherit;padding:2px 4px}.gfk-kname:hover{border-color:#c9c2ae}.gfk-kname:focus{outline:none;border-color:#8a7a5a;background:#fff}";document.head.appendChild(st)}
setTimeout(()=>{try{pinNamesLoad()}catch(e){}},500);


/* --- shovel: dig straight through the Earth (where would you come out?), or cut a cross-section --- */
const R_KM=6371;
const featsNear=()=>{try{return projFeatures().filter(f=>f.geometry&&f.properties&&f.properties.c)}catch(e){return[]}};
function digPlace(ll){const fs=featsNear();for(const f of fs){try{if(d3.geoContains(f,ll)){const c=String(f.properties.c).toLowerCase();return{land:true,c,n:(COUNTRY_BY_CODE[c]||{}).n||f.properties.n||c.toUpperCase()}}}catch(e){}}
 /* at sea: how deep, and the nearest land */
 let best=null,bd=Infinity;fs.forEach(f=>{const g=f.geometry,polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];polys.forEach(P=>{const r=P[0],step=Math.max(1,Math.floor(r.length/60));for(let i=0;i<r.length;i+=step){const d=d3.geoDistance(ll,r[i]);if(d<bd){bd=d;best=f}}})});
 let depth=null;try{if(window.gfCrossSection&&gfCrossSection.elevAt)depth=-gfCrossSection.elevAt(ll[0],ll[1])}catch(e){}
 const nc=best?String(best.properties.c).toLowerCase():null;return{land:false,depth,near:nc?((COUNTRY_BY_CODE[nc]||{}).n||nc.toUpperCase()):null,km:Math.round(bd*R_KM)}}
const anti=ll=>[ll[0]>0?ll[0]-180:ll[0]+180,-ll[1]];
const fmtLL=ll=>Math.abs(ll[1]).toFixed(1)+"°"+(ll[1]>=0?"N":"S")+", "+Math.abs(ll[0]).toFixed(1)+"°"+(ll[0]>=0?"E":"W");
function describe(P){return P.land?"<b>"+esc(P.n)+"</b>":"<b>the open sea</b>"+(P.depth>0?", about "+Math.round(P.depth).toLocaleString()+" m deep":"")+(P.near?" — the nearest land is "+esc(P.near)+", about "+P.km.toLocaleString()+" km away":"")}
/* the Earth cut in half, with the hole drawn straight through the middle */
function earthCut(){return'<svg viewBox="0 0 220 220" class="gfk-cut" role="img" aria-label="The Earth cut in half: crust, mantle, outer core and inner core, with a tunnel through the centre"><defs><radialGradient id="gfkCore" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#ffbe3b"/></radialGradient></defs>'+
 '<circle cx="110" cy="110" r="104" fill="#2f6fb0"/><circle cx="110" cy="110" r="100" fill="#c0532f"/><circle cx="110" cy="110" r="99" fill="#d9772f"/>'+
 '<circle cx="110" cy="110" r="54.6" fill="#f2b33d"/><circle cx="110" cy="110" r="19.2" fill="url(#gfkCore)"/>'+
 '<line x1="110" y1="4" x2="110" y2="216" stroke="#1d1d1d" stroke-width="3" stroke-dasharray="6 4"/><circle cx="110" cy="6" r="5" fill="#c0392b" stroke="#fff" stroke-width="2"/><circle cx="110" cy="214" r="5" fill="#2e7d32" stroke="#fff" stroke-width="2"/>'+
 '<g font-size="9" font-weight="700" fill="#fff" stroke="#000" stroke-width="2" paint-order="stroke"><text x="120" y="30">Mantle</text><text x="120" y="66">Outer core (liquid)</text><text x="120" y="108">Inner core</text><text x="118" y="118" font-size="8">5,200 °C</text><text x="8" y="12" font-size="8">Crust (thin as an apple skin)</text></g></svg>'}
function dig(ll){if(!ll)return;const B=anti(ll),PA=digPlace(ll),PB=digPlace(B);S.shovelArm=false;
 const p=panel("gfkShovel",'<b class="gfk-ph">Shovel</b>'+segHTML("dig")+'<div class="gfk-dig">'+earthCut()+'<div class="gfk-digt"><p>You start in '+describe(PA)+' <small>('+fmtLL(ll)+')</small>.</p><p>Dig straight down through the centre, '+(2*R_KM).toLocaleString()+' km, and you come out in '+describe(PB)+' <small>('+fmtLL(B)+')</small>.</p>'+
  '<p class="gfk-hint">On the way: about 35 km of crust, 2,900 km of rocky mantle, then an iron core about as hot as the surface of the Sun. Fall down a tunnel with no air and you would reach the far side in about 40 minutes.</p>'+
  (PB.land?'':'<p class="gfk-hint">Most holes come out at sea: almost all land has ocean on its opposite side. Only about 15% of land has land on its opposite side: Argentina and China, for example, or New Zealand and Spain.</p>')+
  '<button type="button" class="gfk-link" data-go>Show me where I come out →</button> <button type="button" class="gfk-link" data-again>Dig somewhere else</button></div></div>',true);if(!p)return;wireSeg(p);
 holes([ll,B]);p.querySelector("[data-go]").onclick=()=>flyTo(B);p.querySelector("[data-again]").onclick=()=>{S.shovelArm=true;toast("Click anywhere on the map to dig")}}
function segHTML(m){const cut=window.gfCutaway&&gfCutaway.ok();return'<div class="gfk-seg"><button type="button" data-sm="xs" class="'+(m==="xs"?"on":"")+'">✂ Cross-section</button><button type="button" data-sm="dig" class="'+(m==="dig"?"on":"")+'">⛏ Dig through</button>'+(cut?'<button type="button" data-sm="cut" class="'+(gfCutaway.isOn()?"on":"")+'">🌋 Inside the Earth</button>':'')+'</div>'}
/* the shovel opens the cross-section first (on the flat map); Dig through is one click away */
function shovelOpen(){try{if(window.gfCrossSection&&typeof amGlobe!=="undefined"&&amGlobe&&amGlobe._flat){closePanels();S.shovelArm=false;gfCrossSection.start();return}}catch(e){}shovelPanel()}
window.gfShovelDig=()=>{try{gfCrossSection.stop()}catch(e){}shovelPanel()};
function wireSeg(p){p.querySelectorAll("[data-sm]").forEach(b=>b.onclick=()=>{if(b.dataset.sm==="cut"){try{gfCutaway.toggle()}catch(e){}b.classList.toggle("on",gfCutaway.isOn());if(gfCutaway.isOn())closePanels();return}if(b.dataset.sm==="xs"){closePanels();S.shovelArm=false;try{gfCrossSection.start()}catch(e){toast("Cross-sections need the flat map or globe")}}else shovelPanel()})}
function shovelPanel(){const p=panel("gfkShovel",'<b class="gfk-ph">Shovel</b>'+segHTML("dig")+'<p class="gfk-hint">Click a place on the map (or drag the shovel onto it) and dig straight through the middle of the Earth. Where do you come out?</p>');if(!p)return;wireSeg(p);S.shovelArm=true}
/* the two holes, kept on the map */
let HOLES=[],holeRaf=0;function holes(L){HOLES=L;cancelAnimationFrame(holeRaf);const h=host();document.querySelectorAll(".gfk-hole").forEach(x=>x.remove());if(!h)return;
 const els=L.map((ll,i)=>{const d=document.createElement("div");d.className="gfk-hole"+(i?" gfk-hole-b":"");d.title=i?"Where you come out":"Where you dug";d.innerHTML=i?"⬆":"⛏";h.appendChild(d);return d});
 const tick=()=>{if(!document.querySelector(".gfk-hole")){return}const hr=h.getBoundingClientRect();L.forEach((ll,i)=>{const q=toScreen(ll);els[i].style.display=q?"":"none";if(q){els[i].style.left=(q[0]-hr.left)+"px";els[i].style.top=(q[1]-hr.top)+"px"}});holeRaf=requestAnimationFrame(tick)};tick();
 setTimeout(()=>{document.querySelectorAll(".gfk-hole").forEach(x=>x.classList.add("gfk-hole-old"))},60000)}
function flyTo(ll){try{if(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.host.isConnected){amGlobe.rot=[-ll[0],-ll[1]];amGlobe.zoom=Math.max(amGlobe.zoom||1,amGlobe._flat?2.5:1.6);amGlobe.request?amGlobe.request():amGlobe.render()}}catch(e){}}
/* while the shovel is out, a click on the map digs there (and nothing else: no country card) */
{let dn=null;const inMap=e=>{const h=host();return h&&h.contains(e.target)&&!(e.target.closest&&e.target.closest(".gfk-tray,.gfk-panel,.gfk-obj,button,input,label"))};
 addEventListener("pointerdown",e=>{if(!S.shovelArm||!inMap(e))return;dn=[e.clientX,e.clientY,e.pointerId]},true);
 addEventListener("pointerup",e=>{if(!S.shovelArm||!dn||e.pointerId!==dn[2])return;const moved=Math.hypot(e.clientX-dn[0],e.clientY-dn[1])>6;dn=null;if(moved||!inMap(e))return;const ll=toLL(e.clientX,e.clientY);if(!ll)return;
  /* the map still gets its pointer-up (so it stops dragging); only its click (the country card) is skipped */
  try{const g=amGlobe;if(g&&g.cfg&&!g.cfg._gfShovel){const c=g.cfg.click;g.cfg.click=function(){if(S._shovelEat&&Date.now()-S._shovelEat<600)return;return c&&c.apply(this,arguments)};g.cfg._gfShovel=1}}catch(_){}
  S._shovelEat=Date.now();setTimeout(()=>dig(ll),0)},true);
 addEventListener("click",e=>{if(S._shovelEat&&Date.now()-S._shovelEat<600){e.stopImmediatePropagation();e.preventDefault();S._shovelEat=0}},true)}
{const st=document.createElement("style");st.textContent=`.gfk-seg{display:inline-flex;background:#efe7dc;border-radius:999px;padding:2px;margin:4px 0 8px}.gfk-seg button{border:0;background:none;border-radius:999px;padding:5px 11px;font:700 12px system-ui;color:#5b3a17;cursor:pointer}.gfk-seg button.on{background:#8a5a2b;color:#fff}
#gfkShovel{width:min(540px,calc(100vw - 24px))}.gfk-dig{display:flex;gap:14px;align-items:flex-start}.gfk-cut{width:170px;height:170px}.gfk-cut{width:150px;height:150px;flex:none}.gfk-digt p{margin:0 0 6px;font-size:13px;line-height:1.4}.gfk-digt small{opacity:.6}
.gfk-hole{position:absolute;z-index:31;transform:translate(-50%,-50%);width:26px;height:26px;border-radius:50%;background:#3b2a1a;color:#fff;font-size:13px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px #fff,0 3px 8px rgba(0,0,0,.4);pointer-events:none}.gfk-hole-b{background:#2e7d32}
@media (max-width:600px){.gfk-dig{flex-direction:column;align-items:center}}`;document.head.appendChild(st)}

/* --- geometry set: ruler, drawing compass, range rings, straight lines, rectangles and ovals, and "line up" (a place's latitude and
   longitude drawn around the world). "True to the globe": lines follow the Earth's curve and rings keep a real distance; off, shapes look
   exactly as drawn on the screen. Shapes are kept with the drawings (Pens' Undo and Clear work on them too). --- */
try{S.penW=K().penW||1}catch(e){}
const GEO={mode:"compass",tru:true,km:1000,col:"#c8281c",sel:-1};
try{Object.assign(GEO,K().geo||{})}catch(e){}
const geoSave=()=>{try{K().geo={mode:GEO.mode,tru:GEO.tru,km:GEO.km,col:GEO.col};save()}catch(e){}};
const RAD=Math.PI/180,KM=6371;
function dest(ll,brg,d){const f1=ll[1]*RAD,l1=ll[0]*RAD,t=brg*RAD,f2=Math.asin(Math.sin(f1)*Math.cos(d)+Math.cos(f1)*Math.sin(d)*Math.cos(t)),l2=l1+Math.atan2(Math.sin(t)*Math.sin(d)*Math.cos(f1),Math.cos(d)-Math.sin(f1)*Math.sin(f2));return[((l2/RAD+540)%360)-180,f2/RAD]}
function bearing(a,b){const f1=a[1]*RAD,f2=b[1]*RAD,dl=(b[0]-a[0])*RAD;return Math.atan2(Math.sin(dl)*Math.cos(f2),Math.cos(f1)*Math.sin(f2)-Math.sin(f1)*Math.cos(f2)*Math.cos(dl))/RAD}
const gc=(a,b,n)=>{const f=d3.geoInterpolate(a,b),o=[];for(let i=0;i<=n;i++)o.push(f(i/n));return o};
const kmTxt=k=>(k>=100?Math.round(k):k.toFixed(1)).toLocaleString()+" km";
const fix=pts=>pts.filter(q=>q&&isFinite(q[0])).map(q=>[+q[0].toFixed(3),+q[1].toFixed(3)]);
/* screen shapes, turned into places point by point */
const scr=pts=>fix(pts.map(q=>toLL(q[0],q[1])));
function shape(mode,a,b,shift,A,B){/* a,b: screen points; A,B: their places */
 if(mode==="line"){if(GEO.tru){const d=d3.geoDistance(A,B)*KM;return{p:fix(gc(A,B,64)),lab:kmTxt(d),at:d3.geoInterpolate(A,B)(.5)}}const n=48;return{p:scr([...Array(n+1)].map((_,i)=>[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]))}}
 if(mode==="compass"){if(GEO.tru){const d=d3.geoDistance(A,B);if(shift){const b0=bearing(A,B),C=[0,1,2,3,4].map(k=>dest(A,b0+k*90,d));let p=[];for(let k=0;k<4;k++)p=p.concat(gc(C[k],C[k+1],24));return{p:fix(p),f:1,lab:kmTxt(d*KM),at:A}}
   const ring=d3.geoCircle().center(A).radius(d/RAD).precision(1.5)().coordinates[0];return{p:fix(ring),f:1,lab:"r = "+kmTxt(d*KM),at:d3.geoInterpolate(A,B)(.5)}}/* the label sits halfway along the radius, so circles round one centre keep their labels apart */
  const r=Math.hypot(b[0]-a[0],b[1]-a[1]);if(shift)return{p:scr([[a[0]-r,a[1]-r],[a[0]+r,a[1]-r],[a[0]+r,a[1]+r],[a[0]-r,a[1]+r],[a[0]-r,a[1]-r]].flatMap((q,i,L)=>i?[...Array(12)].map((_,k)=>[L[i-1][0]+(q[0]-L[i-1][0])*(k+1)/12,L[i-1][1]+(q[1]-L[i-1][1])*(k+1)/12]):[q])),f:1};
  return{p:scr([...Array(73)].map((_,i)=>[a[0]+r*Math.cos(i/72*2*Math.PI),a[1]+r*Math.sin(i/72*2*Math.PI)])),f:1}}
 if(mode==="rect"||mode==="oval"){let x0=a[0],y0=a[1],x1=b[0],y1=b[1];
  if(GEO.tru){let w=A[0],e=B[0],sN=A[1],nN=B[1];if(shift){const k=Math.cos(((sN+nN)/2)*RAD);const half=Math.abs(e-w)*k/2,mid=(sN+nN)/2,sg=nN>=sN?1:-1;nN=mid+sg*half;sN=mid-sg*half}
   if(mode==="rect"){const P=[];const N=40;for(let i=0;i<=N;i++)P.push([w+(e-w)*i/N,sN]);for(let i=0;i<=N;i++)P.push([e,sN+(nN-sN)*i/N]);for(let i=0;i<=N;i++)P.push([e-(e-w)*i/N,nN]);for(let i=0;i<=N;i++)P.push([w,nN-(nN-sN)*i/N]);return{p:fix(P),f:1}}
   const cx=(w+e)/2,cy=(sN+nN)/2,rx=Math.abs(e-w)/2,ry=Math.abs(nN-sN)/2;return{p:fix([...Array(97)].map((_,i)=>[cx+rx*Math.cos(i/96*2*Math.PI),cy+ry*Math.sin(i/96*2*Math.PI)])),f:1}}
  if(shift){const d=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));x1=x0+Math.sign(x1-x0||1)*d;y1=y0+Math.sign(y1-y0||1)*d}
  if(mode==="rect"){const C=[[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]],P=[C[0]];for(let i=1;i<5;i++)for(let k=1;k<=16;k++)P.push([C[i-1][0]+(C[i][0]-C[i-1][0])*k/16,C[i-1][1]+(C[i][1]-C[i-1][1])*k/16]);return{p:scr(P),f:1}}
  const cx=(x0+x1)/2,cy=(y0+y1)/2,rx=Math.abs(x1-x0)/2,ry=Math.abs(y1-y0)/2;return{p:scr([...Array(73)].map((_,i)=>[cx+rx*Math.cos(i/72*2*Math.PI),cy+ry*Math.sin(i/72*2*Math.PI)])),f:1}}
 return null}
function ringAt(A){const ring=d3.geoCircle().center(A).radius(GEO.km/KM/RAD).precision(1.5)().coordinates[0];const top=A[1]+GEO.km/KM/RAD<84?dest(A,0,GEO.km/KM):dest(A,180,GEO.km/KM);return{p:fix(ring),f:1,lab:kmTxt(GEO.km),at:top}}
function keep(o){if(!o||!o.p||o.p.length<2)return;hist();const k=K();k.ink.push(Object.assign({t:o.t||"geo",c:GEO.col},o));if(k.ink.length>400)k.ink.shift();save();render();geoList()}
/* every shape keeps how it was made (g), so it can be rebuilt when it is moved or resized */
function build(g){if(g.m==="text")return{p:[g.A.slice(),g.A.slice()]};const T=GEO.tru,K0=GEO.km;GEO.tru=!!g.tru;try{if(g.m==="ring"){GEO.km=g.km;return ringAt(g.A)}const a=toScreen(g.A),b=toScreen(g.B);if(!g.tru&&(!a||!b))return null;return shape(g.m,a||[0,0],b||[0,0],!!g.sh,g.A,g.B)}finally{GEO.tru=T;GEO.km=K0}}
function rebuild(s){if(!s||!s.g)return;const o=build(s.g);if(!o||!o.p||o.p.length<2)return;s.p=o.p;if(o.f)s.f=1;else delete s.f;if(o.lab){s.lab=o.lab;s.at=o.at}else{delete s.lab;delete s.at}}
const hav=(p,q)=>{const a=Math.sin((q[1]-p[1])*RAD/2)**2+Math.cos(p[1]*RAD)*Math.cos(q[1]*RAD)*Math.sin((q[0]-p[0])*RAD/2)**2;return 2*Math.asin(Math.min(1,Math.sqrt(a)))};
/* the handles of a shape: c = centre (moves it), r = edge (resizes it), a/b = its two ends or corners */
function handles(s){const g=s&&s.g;if(!g)return[];if(g.m==="text")return[{k:"c",ll:g.A}];if(g.m==="ring")return[{k:"c",ll:g.A},{k:"r",ll:dest(g.A,90,g.km/KM)}];if(g.m==="compass")return[{k:"c",ll:g.A},{k:"r",ll:g.B}];return[{k:"a",ll:g.A},{k:"b",ll:g.B}]}
function segD(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy;let t=L?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L:0;t=Math.max(0,Math.min(1,t));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)}
/* what is under the pointer: a handle of a chosen shape, else the edge, label or text of any shape.
   only=handles: while drawing, only the white dots answer, so new shapes can be drawn on top of old ones */
const selList=()=>{const n=K().ink.length;const L=(GEO.sels||[]).filter(i=>i>=0&&i<n);if(GEO.sel>=0&&GEO.sel<n&&!L.includes(GEO.sel))L.push(GEO.sel);return L};
function txtAt(s){const g=s.g;if(g){if(g.m==="ring"||g.m==="compass"||g.m==="text")return g.A;if(g.B)return d3.geoInterpolate(g.A,g.B)(.5)}return s.at||s.p[0]}
function geoHit(x,y,only){const ink=K().ink;for(const i of selList()){const sel=ink[i];for(const h of handles(sel)){if(only==="handles"&&h.k==="c")continue;/* while drawing, a centre is where new shapes start, not a handle */const q=toScreen(h.ll);if(q&&Math.hypot(q[0]-x,q[1]-y)<12)return{i,h:h.k}}}
 if(only==="handles")return null;
 for(let i=ink.length-1;i>=0;i--){const s=ink[i];
  if(s.tx){const q=toScreen(txtAt(s)),fs=s.fs||13,dy=s.lab&&s.g&&(s.g.m==="ring"||s.g.m==="compass")?fs+4:0;if(q&&Math.abs(q[0]-x)<s.tx.length*fs*.32+6&&Math.abs(q[1]+dy-y)<fs*.7+3)return{i,h:"body"}}
  if(s.t==="geoText")continue;
  if(s.at&&s.lab){const q=toScreen(s.at);if(q&&Math.abs(q[0]-x)<s.lab.length*3.6+4&&Math.abs(q[1]-y)<9)return{i,h:"body"}}
  let prev=null;for(const ll of s.p){const q=toScreen(ll);if(q&&prev&&Math.hypot(q[0]-prev[0],q[1]-prev[1])<400&&segD([x,y],prev,q)<7)return{i,h:"body"};prev=q}
  /* inside a filled shape counts too, like clicking a filled shape in a slide */
  if(s.f&&(s.fo==null||s.fo>0)&&s.g){const L=toLL(x,y);try{if(L&&d3.geoContains({type:"Polygon",coordinates:[s.p]},L)&&d3.geoArea({type:"Polygon",coordinates:[s.p]})<2*Math.PI)return{i,h:"body"}}catch(e){}}}
 return null}
/* centres and ends of shapes already drawn: a new shape started close to one starts exactly there (rings round the same place) */
function snapAt(x,y){let best=null,bd=13;K().ink.forEach(s=>{const g=s.g;if(!g)return;[g.A,g.m==="line"?g.B:null].forEach(ll=>{if(!ll)return;const q=toScreen(ll);if(!q)return;const d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best={ll:ll.slice(),q}}})});return best}
/* undo and redo keep whole copies of the shapes, like a slide's undo */
const HIST={u:[],r:[]};
function hist(){try{HIST.u.push(JSON.stringify(K().ink));if(HIST.u.length>80)HIST.u.shift();HIST.r=[]}catch(e){}}
function undoGeo(){const k=K();if(!HIST.u.length){if(k.ink.length){k.ink.pop();GEO.sel=-1;GEO.sels=[];save();render();geoList()}return}HIST.r.push(JSON.stringify(k.ink));k.ink=JSON.parse(HIST.u.pop());GEO.sel=-1;GEO.sels=[];save();render();geoList()}
function redoGeo(){if(!HIST.r.length)return;const k=K();HIST.u.push(JSON.stringify(k.ink));k.ink=JSON.parse(HIST.r.pop());GEO.sel=-1;GEO.sels=[];save();render();geoList()}
function geoSelect(i,add){if(add&&i>=0){const L=selList();const j=L.indexOf(i);if(j>=0){L.splice(j,1);GEO.sels=L;GEO.sel=L.length?L[L.length-1]:-1}else{L.push(i);GEO.sels=L;GEO.sel=i}}else{GEO.sel=i;GEO.sels=i>=0?[i]:[]}
 const s=K().ink[GEO.sel];if(s&&s.c&&GCOLS.includes(s.c)){GEO.col=s.c;document.querySelectorAll("#gfkGeo [data-gc]").forEach(x=>x.classList.toggle("on",x.dataset.gc===s.c))}render();geoList()}
function geoDeleteMany(L){const k=K();if(!L.length)return;hist();L.slice().sort((a,b)=>b-a).forEach(i=>{if(i>=0&&i<k.ink.length)k.ink.splice(i,1)});GEO.sel=-1;GEO.sels=[];save();render();geoList()}
function geoDelete(i){geoDeleteMany([i])}
/* moving a shape: rings and true circles keep their size on the globe; other shapes move by the same change of longitude and latitude */
const clampLat=v=>Math.max(-85,Math.min(85,v)),wrapLon=v=>((v+540)%360)-180;
function moveG(g,A0,B0,dx,dy){const circ=g.m==="ring"||g.m==="text"||(g.m==="compass"&&g.tru);g.A=[wrapLon(A0[0]+dx),clampLat(A0[1]+dy)];if(B0)g.B=circ?dest(g.A,bearing(A0,B0),hav(A0,B0)):[wrapLon(B0[0]+dx),clampLat(B0[1]+dy)]}
/* a step on the screen, as a change of longitude and latitude near the shape */
function screenStep(ll,px,py){const q=toScreen(ll);if(q){const L=toLL(q[0]+px,q[1]+py);if(L)return[((L[0]-ll[0]+540)%360)-180,L[1]-ll[1]]}return[px*.1,-py*.1]}
let geoBusy=false;
function geoDrag(hit,e){const L0=toLL(e.clientX,e.clientY);if(!L0)return;const ink=K().ink;
 if(e.shiftKey&&hit.h==="body"){geoSelect(hit.i,true);return}
 if(!selList().includes(hit.i))geoSelect(hit.i);else{GEO.sel=hit.i;render();geoList()}
 const many=hit.h==="body"?selList():[hit.i];const st=many.map(i=>{const s=ink[i];return s&&s.g?{s,g:s.g,A0:s.g.A.slice(),B0:s.g.B?s.g.B.slice():null,km0:s.g.km}:null}).filter(Boolean);if(!st.length)return;
 geoBusy=true;let moved=false;
 const mv=ev=>{const L=toLL(ev.clientX,ev.clientY);if(!L)return;if(!moved&&Math.hypot(ev.clientX-e.clientX,ev.clientY-e.clientY)<3)return;if(!moved)hist();moved=true;ev.preventDefault();
  const one=st.find(o=>o.s===ink[hit.i])||st[0],g=one.g;
  if(hit.h==="r"){if(g.m==="ring")g.km=Math.max(1,Math.round(hav(g.A,L)*KM));else g.B=L;rebuild(one.s)}
  else if(hit.h==="a"){g.A=L;rebuild(one.s)}else if(hit.h==="b"){g.B=L;rebuild(one.s)}
  else{let dx=((L[0]-L0[0]+540)%360)-180,dy=L[1]-L0[1];if(ev.shiftKey){if(Math.abs(dx)>Math.abs(dy))dy=0;else dx=0}/* Shift keeps the move straight across or straight up */st.forEach(o=>{moveG(o.g,o.A0,o.B0,dx,dy);rebuild(o.s)})}
  render();geoInfo()};
 const up=()=>{removeEventListener("pointermove",mv,true);removeEventListener("pointerup",up,true);geoBusy=false;if(moved){save();geoList();const k=ev=>{ev.stopPropagation();ev.preventDefault()};addEventListener("click",k,true);setTimeout(()=>removeEventListener("click",k,true),60)}};
 addEventListener("pointermove",mv,true);addEventListener("pointerup",up,true)}
/* with the Select tool (or no tool), the map pans as usual, but pressing a shape picks it; Shift adds to the choice */
document.addEventListener("pointerdown",e=>{if(e.button||cap||!document.getElementById("gfkGeo"))return;const h=host();if(!h||!h.contains(e.target)||(e.target.closest&&e.target.closest(".gfk-tray,.gfk-panel,.gfk-obj,button,input,label,.flk,.globe-btns")))return;
 const hit=geoHit(e.clientX,e.clientY);if(!hit){if(GEO.sel>=0&&!e.shiftKey){GEO.sel=-1;GEO.sels=[];render();geoList()}return}e.preventDefault();e.stopPropagation();geoDrag(hit,e);
 const k=ev=>{ev.stopPropagation();ev.preventDefault()};addEventListener("click",k,true);setTimeout(()=>removeEventListener("click",k,true),400)},true);
["mousedown","touchstart"].forEach(t=>document.addEventListener(t,e=>{if(geoBusy)e.stopPropagation()},true));
/* copy, paste, duplicate: copies land a little to the right and below, as in a slide */
let CLIP=null;
function pasteShapes(list,offPx){if(!list||!list.length)return;hist();const k=K(),n0=k.ink.length;list.forEach(src=>{const s=JSON.parse(JSON.stringify(src));if(s.g){const d=screenStep(s.g.A,offPx,offPx);moveG(s.g,s.g.A.slice(),s.g.B?s.g.B.slice():null,d[0],d[1]);rebuild(s)}else{const d=screenStep(s.p[0],offPx,offPx);s.p=s.p.map(q=>[wrapLon(q[0]+d[0]),clampLat(q[1]+d[1])]);if(s.at)s.at=[wrapLon(s.at[0]+d[0]),clampLat(s.at[1]+d[1])]}k.ink.push(s)});
 GEO.sels=[];for(let i=n0;i<k.ink.length;i++)GEO.sels.push(i);GEO.sel=k.ink.length-1;save();render();geoList()}
const copySel=()=>{const ink=K().ink;CLIP=selList().map(i=>JSON.parse(JSON.stringify(ink[i])))};
function nudge(px,py){const L=selList();if(!L.length)return;hist();const ink=K().ink;L.forEach(i=>{const s=ink[i];if(!s||!s.g)return;const d=screenStep(s.g.A,px,py);moveG(s.g,s.g.A.slice(),s.g.B?s.g.B.slice():null,d[0],d[1]);rebuild(s)});save();render()}
/* bring to front / send to back: the order of the list is the drawing order */
function arrange(front){const L=selList();if(!L.length)return;hist();const k=K(),pick=L.slice().sort((a,b)=>a-b).map(i=>k.ink[i]),rest=k.ink.filter((_,i)=>!L.includes(i));k.ink=front?rest.concat(pick):pick.concat(rest);const base=front?rest.length:0;GEO.sels=pick.map((_,j)=>base+j);GEO.sel=GEO.sels[GEO.sels.length-1];save();render();geoList()}
function styleSel(fn){const L=selList();if(!L.length)return;hist();const ink=K().ink;L.forEach(i=>{if(ink[i])fn(ink[i])});save();render();geoList()}
/* a ring around the same centre: one step further out than the biggest ring there */
function addConcentric(s){const g=s.g;if(!g||g.m!=="ring")return;const same=K().ink.filter(x=>x.g&&x.g.m==="ring"&&hav(x.g.A,g.A)<1e-6).map(x=>x.g.km).sort((a,b)=>a-b);const step=same.length>1?same[same.length-1]-same[same.length-2]:same[0];
 const km=same[same.length-1]+step;if(km>20000)return;hist();const o=(GEO.km=km,ringAt(g.A));o.g={m:"ring",A:g.A.slice(),km};K().ink.push(Object.assign({t:"geo",c:s.c},o,{w:s.w,d:s.d,fo:s.fo}));GEO.km=km;save();geoSelect(K().ink.length-1)}
document.addEventListener("keydown",e=>{if(!document.getElementById("gfkGeo")||(e.target.closest&&e.target.closest("input,textarea,select,[contenteditable]")))return;const mod=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
 if(mod&&k==="z"&&!e.shiftKey){e.preventDefault();undoGeo();return}if(mod&&(k==="y"||k==="z"&&e.shiftKey)){e.preventDefault();redoGeo();return}
 if(mod&&k==="a"){e.preventDefault();const n=K().ink.length;GEO.sels=[...Array(n).keys()];GEO.sel=n-1;render();geoList();return}
 if(mod&&k==="v"&&CLIP){e.preventDefault();pasteShapes(CLIP,24);return}
 const L=selList();if(!L.length)return;
 if(e.key==="Delete"||e.key==="Backspace"){e.preventDefault();geoDeleteMany(L);return}
 if(e.key==="Escape"){GEO.sel=-1;GEO.sels=[];render();geoList();return}
 if(mod&&k==="c"){e.preventDefault();copySel();return}if(mod&&k==="x"){e.preventDefault();copySel();geoDeleteMany(L);return}
 if(mod&&k==="d"){e.preventDefault();copySel();pasteShapes(CLIP,24);return}
 const AR={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1]}[k];if(AR){e.preventDefault();const st=e.shiftKey?12:2;nudge(AR[0]*st,AR[1]*st)}},true);
const KIND={compass:"Circle",ring:"Range ring",line:"Straight line",rect:"Rectangle",oval:"Oval",text:"Text"};
function kindOf(s){if(s.g)return s.g.m==="compass"&&s.g.sh?"Square":s.g.m==="rect"&&s.g.sh?"Square":s.g.m==="oval"&&s.g.sh?"Circle":KIND[s.g.m]||"Shape";if(s.t==="geoDash")return s.lab?"Latitude line":"Longitude line";if(s.t==="geo")return"Shape";return"Pen drawing"}
/* the list of shapes: pick one (Shift adds), or remove just that one */
function geoList(){const box=document.querySelector("#gfkGeoMore .gfk-shapes");if(!box){geoInfo();return}const ink=K().ink,L=selList();
 if(!ink.length){box.innerHTML='<p class="gfk-hint">No shapes yet.</p>';geoInfo();return}
 box.innerHTML='<p class="gfk-hint">Your shapes ('+ink.length+'), top of the list is drawn on top. Click to pick, Shift-click to pick several, × removes one.</p><ul>'+ink.map((s,i)=>'<li data-si="'+i+'" class="'+(L.includes(i)?"on":"")+'"><i style="background:'+esc(s.c||"#888")+'"></i><span>'+kindOf(s)+(s.tx?' “'+esc(s.tx.slice(0,18))+'”':'')+(s.lab?' <small>'+esc(s.lab)+'</small>':'')+'</span><button type="button" data-sx="'+i+'" aria-label="Remove this shape" title="Remove">×</button></li>').reverse().join("")+'</ul>';
 box.querySelectorAll("[data-si]").forEach(li=>li.onclick=e=>{if(e.target.closest("[data-sx]"))return;const i=+li.dataset.si;if(e.shiftKey)geoSelect(i,true);else geoSelect(GEO.sel===i&&L.length===1?-1:i)});
 box.querySelectorAll("[data-sx]").forEach(b=>b.onclick=()=>geoDelete(+b.dataset.sx));const on=box.querySelector("li.on");if(on)on.scrollIntoView({block:"nearest"});geoInfo()}
/* the chosen shapes. The geometry panel keeps a short bar (size, Duplicate, Remove); outline, fill, arrows, text and order
   are in the separate "More settings" window, so the panel stays small */
function morePanel(id,title,html,anchor){let m=document.getElementById(id);if(!m){m=document.createElement("div");m.className="gfk-panel gfk-more";m.id=id;document.body.appendChild(m);
  ["pointerdown","mousedown","click","wheel","dblclick","keydown"].forEach(t=>m.addEventListener(t,e=>e.stopPropagation()));
  m.addEventListener("pointerdown",e=>{if(!e.target.closest(".gfk-grip,.gfk-ph"))return;e.preventDefault();const r=m.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;
   const mv=ev=>{m.style.left=ev.clientX-dx+"px";m.style.top=ev.clientY-dy+"px";clampPanel(m)};const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);PPOS[id]=[parseFloat(m.style.left),parseFloat(m.style.top)]};addEventListener("pointermove",mv);addEventListener("pointerup",up)});
  const a=anchor&&anchor.getBoundingClientRect(),pos=PPOS[id];if(pos){m.style.left=pos[0]+"px";m.style.top=pos[1]+"px"}else if(a){const right=a.right+10+300<innerWidth;m.style.left=(right?a.right+10:Math.max(8,a.left-310))+"px";m.style.top=Math.max(8,a.top)+"px"}}
 m.innerHTML='<div class="gfk-grip" title="Drag to move"><i></i></div><button type="button" class="gfk-px" aria-label="Close">×</button><b class="gfk-ph">'+esc(title)+'</b>'+html;m.querySelector(".gfk-px").onclick=()=>m.remove();clampPanel(m);return m}
const segH=(name,opts,cur)=>'<span class="gfk-seg" data-sg="'+name+'">'+opts.map(([v,lab,t])=>'<button type="button" data-v="'+v+'" class="'+(String(cur)===String(v)?"on":"")+'" title="'+esc(t||lab)+'">'+lab+'</button>').join("")+'</span>';
function geoInfo(){geoBar();geoFmt()}
function geoBar(){const box=document.querySelector("#gfkGeo .gfk-selbar");if(!box)return;const L=selList(),ink=K().ink,s=ink[GEO.sel];if(!s||!L.length){box.hidden=true;box.innerHTML="";return}box.hidden=false;const g=s.g,many=L.length>1;
 const act=document.activeElement;if(act&&box.contains(act)&&act.tagName==="INPUT")return;
 const r=!many&&g&&(g.m==="ring"?g.km:g.m==="compass"&&g.tru?Math.round(hav(g.A,g.B)*KM):null);
 box.innerHTML='<b>'+(many?L.length+" shapes":kindOf(s))+'</b>'+(r!=null&&r!==false?'<label><input data-r type="number" min="1" max="20000" step="10" value="'+r+'"> km</label>':(!many&&s.lab?' <small>'+esc(s.lab)+'</small>':''))+
  (!many&&s.t==="geoText"?'<input data-tx type="text" maxlength="60" placeholder="Type here" value="'+esc(s.tx||"")+'">':'')+'<span class="gfk-sp"></span>'+
  (!many&&g&&g.m==="ring"?'<button type="button" data-a="ring" title="Add a ring around the same centre">+ ring</button>':'')+'<button type="button" data-a="dup" title="Duplicate (Ctrl+D)">Duplicate</button><button type="button" data-a="del" class="gfk-del" title="Delete key">Remove</button>';
 const ri=box.querySelector("[data-r]");if(ri){let first=true;ri.oninput=()=>{const v=Math.max(1,Math.min(20000,+ri.value||0));if(!v)return;if(first){hist();first=false}if(g.m==="ring")g.km=v;else g.B=dest(g.A,bearing(g.A,g.B),v/KM);rebuild(s);save();render()};ri.onchange=()=>geoList()}
 const ti=box.querySelector("[data-tx]");if(ti){let first=true;ti.oninput=()=>{if(first){hist();first=false}s.tx=ti.value;document.querySelectorAll("#gfkGeo [data-tx],#gfkGeoMore [data-tx]").forEach(x=>{if(x!==ti)x.value=s.tx||""});save();render()};ti.onchange=()=>geoList();if(GEO._focusText){GEO._focusText=false;setTimeout(()=>{ti.focus();ti.select()},30)}}
 box.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==="del")geoDeleteMany(selList());else if(a==="dup"){copySel();pasteShapes(CLIP,24)}else if(a==="ring")addConcentric(s)})}
function geoFmt(){const box=document.querySelector("#gfkGeoMore .gfk-fmt");if(!box)return;const L=selList(),ink=K().ink,s=ink[GEO.sel];
 if(!s||!L.length){box.innerHTML='<p class="gfk-hint">Pick a shape (Select tool) to change its outline, fill, arrows and text.</p>';return}
 const act=document.activeElement;if(act&&box.contains(act)&&act.tagName==="INPUT")return;
 const many=L.length>1,sh=L.map(i=>ink[i]).filter(Boolean),closed=sh.some(x=>x.f),lines=sh.some(x=>x.g&&x.g.m==="line"),isText=sh.every(x=>x.t==="geoText");let h='<p class="gfk-fmtt">'+(many?L.length+" shapes":kindOf(s))+'</p>';
 if(!isText){h+='<div class="gfk-sbrow"><span class="gfk-sl">Line</span>'+segH("w",[[.6,"thin","Thin line"],[1,"normal","Normal line"],[1.8,"thick","Thick line"]],s.w||1)+'</div><div class="gfk-sbrow"><span class="gfk-sl"></span>'+segH("d",[[0,"───","Solid"],[1,"- - -","Dashed"],[2,"·····","Dotted"]],s.d||0)+'</div>';
  if(closed)h+='<div class="gfk-sbrow"><span class="gfk-sl">Fill</span>'+segH("fo",[[0,"none","No fill"],[.16,"light","Light fill"],[.4,"strong","Strong fill"]],s.fo!=null?s.fo:.16)+'</div>';
  if(lines)h+='<div class="gfk-sbrow"><span class="gfk-sl">Arrows</span>'+segH("ar",[[0,"none","No arrowheads"],[1,"→","Arrow at the end"],[2,"↔","Arrows at both ends"]],s.ar||0)+'</div>'}
 if(!many)h+='<div class="gfk-sbrow"><span class="gfk-sl">Text</span><input data-tx type="text" maxlength="60" placeholder="'+(isText?"Type here":"A label on the shape")+'" value="'+esc(s.tx||"")+'"></div>';
 h+='<div class="gfk-sbrow"><span class="gfk-sl">Text size</span>'+segH("fs",[[11,"S","Small text"],[14,"M","Medium text"],[19,"L","Large text"]],s.fs||(isText?14:13))+'</div>';
 h+='<div class="gfk-sbrow"><span class="gfk-sl">Order</span><span class="gfk-sbacts"><button type="button" data-a="front">To front</button><button type="button" data-a="back">To back</button></span></div>';
 box.innerHTML=h;
 box.querySelectorAll("[data-sg]").forEach(sp=>sp.querySelectorAll("button").forEach(b=>b.onclick=()=>{const k=sp.dataset.sg,v=+b.dataset.v;styleSel(x=>{if(k==="w"){if(v===1)delete x.w;else x.w=v}else if(k==="d"){if(!v)delete x.d;else x.d=v}else if(k==="fo"){if(x.f)x.fo=v}else if(k==="ar"){if(x.g&&x.g.m==="line"){if(v)x.ar=v;else delete x.ar}}else if(k==="fs")x.fs=v})}));
 const ti=box.querySelector("[data-tx]");if(ti){let first=true;ti.oninput=()=>{if(first){hist();first=false}s.tx=ti.value;if(!s.tx&&s.t!=="geoText")delete s.tx;document.querySelectorAll("#gfkGeo [data-tx],#gfkGeoMore [data-tx]").forEach(x=>{if(x!==ti)x.value=s.tx||""});save();render()};ti.onchange=()=>geoList()}
 box.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>arrange(b.dataset.a==="front"))}
function geoMore(){const main=document.getElementById("gfkGeo");const m=morePanel("gfkGeoMore","More settings",
  '<div class="gfk-fmt"></div><hr class="gfk-hr">'+
  '<label class="gfk-chk"><input type="checkbox" '+(GEO.tru?"checked":"")+' data-tru> True to the globe <small>'+(GEO.tru?"new lines follow the Earth's curve and sizes are real distances":"new shapes look exactly as you draw them on the screen")+'</small></label>'+
  '<div class="gfk-shapes"></div>'+
  '<div class="gfk-sbacts"><button type="button" data-m="all">Select all</button><button type="button" data-m="clear" class="gfk-del">Clear all</button></div>'+
  '<p class="gfk-hint">Shortcuts: Shift-click picks several · drag with Shift to move straight · arrow keys nudge · Ctrl+C / Ctrl+V / Ctrl+D copy, paste, duplicate · Ctrl+Z / Ctrl+Y undo, redo · Ctrl+A all · Delete removes · Esc lets go.</p>',main);
 m.querySelector("[data-tru]").onchange=e=>{GEO.tru=e.target.checked;geoSave();geoMore()};
 m.querySelector('[data-m="all"]').onclick=()=>{const n=K().ink.length;if(!n)return;GEO.mode="select";geoSave();GEO.sels=[...Array(n).keys()];GEO.sel=n-1;geoPanel();geoMore();render()};
 m.querySelector('[data-m="clear"]').onclick=()=>{if(!K().ink.length)return;if(confirm("Clear all your drawings and shapes?")){hist();K().ink=[];GEO.sel=-1;GEO.sels=[];save();render();geoList()}};
 geoList()}
/* line up: a place's latitude all the way round, and its meridian pole to pole */
let CITYLL=null;function cities(){if(CITYLL)return CITYLL;const PJ=d3.geoRobinson().scale(318.31).translate([1e3,500.5]);CITYLL=[];try{(typeof ALLMAPS_CITIES!=="undefined"?ALLMAPS_CITIES:[]).forEach(r=>{const ll=PJ.invert([r[3],r[4]]);if(ll&&isFinite(ll[0]))CITYLL.push({n:r[0],ll,cap:r[2]===1})})}catch(e){}return CITYLL}
const fmtLat=v=>Math.abs(v).toFixed(1)+"°"+(v>=0?"N":"S"),fmtLon=v=>Math.abs(v).toFixed(1)+"°"+(v>=0?"E":"W");
function ctyOf(ll){try{for(const f of projFeatures()){if(f.geometry&&d3.geoContains(f,ll)){const c=String(f.properties.c).toLowerCase();return(COUNTRY_BY_CODE[c]||{}).n||null}}}catch(e){}return null}
function lineUp(ll,name){const C=cities();if(!name){let best=null,bd=60/KM;C.forEach(c=>{const a=Math.sin((ll[1]-c.ll[1])*RAD/2)**2+Math.cos(c.ll[1]*RAD)*Math.cos(ll[1]*RAD)*Math.sin((ll[0]-c.ll[0])*RAD/2)**2,d=2*Math.asin(Math.min(1,Math.sqrt(a)));if(d<bd){bd=d;best=c}});if(best){name=best.n;ll=best.ll}}
 const lat=ll[1],lon=ll[0],par=[],mer=[];for(let x=-180;x<=180;x+=2)par.push([x,lat]);for(let y=-89;y<=89;y+=2)mer.push([lon,y]);
 keep({t:"geoDash",p:fix(par),lab:(name?name+" · ":"")+fmtLat(lat),at:[lon,lat+(lat>80?-2:2)]});keep({t:"geoDash",p:fix(mer)});
 /* own great-circle distance (the flat map answers 0 for its own centre) */
 const hav=(p,q)=>{const a=Math.sin((q[1]-p[1])*RAD/2)**2+Math.cos(p[1]*RAD)*Math.cos(q[1]*RAD)*Math.sin((q[0]-p[0])*RAD/2)**2;return 2*Math.asin(Math.min(1,Math.sqrt(a)))},far=c=>hav(c.ll,ll)*KM>900;
 const lv=C.filter(c=>far(c)&&Math.abs(c.ll[1]-lat)<.8).sort((a,b)=>(b.cap-a.cap)||Math.abs(a.ll[1]-lat)-Math.abs(b.ll[1]-lat)).slice(0,8);
 const ln=C.filter(c=>far(c)&&Math.abs(((c.ll[0]-lon+540)%360)-180)<.8).sort((a,b)=>(b.cap-a.cap)).slice(0,6);
 const li=(c,k)=>'<li><b>'+esc(c.n)+'</b>'+(ctyOf(c.ll)?', '+esc(ctyOf(c.ll)):'')+' <small>'+(k==="lat"?fmtLat(c.ll[1]):fmtLon(c.ll[0]))+'</small></li>';
 const box=document.querySelector("#gfkGeo .gfk-lu");if(box)box.innerHTML='<p><b>'+esc(name||"This place")+'</b> is at '+fmtLat(lat)+', '+fmtLon(lon)+'.</p>'+
  (lv.length?'<p class="gfk-hint">Level with it (the same latitude):</p><ul class="gfk-lul">'+lv.map(c=>li(c,"lat")).join("")+'</ul>':'')+(ln.length?'<p class="gfk-hint">Due north and south (the same longitude):</p><ul class="gfk-lul">'+ln.map(c=>li(c,"lon")).join("")+'</ul>':'')}
const MODES=[["select",'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 3.5v15.2l4.1-3.9 2.7 6 2.6-1.2-2.7-5.9 5.6-.3z"/></svg>',"Select","Click a shape to pick it (Shift-click to pick several), drag it to move it, drag its white dots to resize it. The map still pans"],["ruler","📏","Ruler","Measure the distance between two places"],["compass",'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.2" r="1.9"/><path d="M11 6 6.2 21M13 6l4.8 15M7.8 15.6c2.6 1.3 5.8 1.3 8.4 0"/></svg>',"Compass","Drag from the centre outwards to draw a circle. Hold Shift for a square"],["ring","◎","Range ring","Click a place: a ring shows everything within that distance. Click the same centre again (it snaps) to add rings around it"],
 ["line","╱","Straight line","Drag from one place to another"],["rect","▭","Rectangle","Drag a box. Hold Shift for a square"],["oval","⬭","Oval","Drag a box. Hold Shift for a circle"],["text","<b style=\"font:800 16px Georgia,serif\">T</b>","Text","Click the map to put a text box there, then type"],["lineup","✛","Line up","Click a place (or type a city) to draw its latitude and longitude around the world"]];
const GCOLS=["#c8281c","#2a3f8f","#1e8c8a","#2f8f3e","#e8762a","#7a3fb0","#1d1b18"];
function geoPanel(){const M=MODES.find(m=>m[0]===GEO.mode);
 const p=panel("gfkGeo",'<b class="gfk-ph">Geometry set</b><div class="gfk-geom">'+MODES.map(m=>'<button type="button" data-gm="'+m[0]+'" class="'+(m[0]===GEO.mode?"on":"")+'" title="'+esc(m[3])+'"><i>'+m[1]+'</i>'+m[2]+'</button>').join("")+'</div>'+
  '<p class="gfk-hint">'+(M&&GEO.mode!=="select"?esc(M[3])+'.':'Click a shape to pick it, drag to move it. The map still pans.')+'</p>'+
  (GEO.mode==="ring"?'<div class="gfk-km"><input type="number" min="1" max="20000" step="50" value="'+GEO.km+'" aria-label="Distance in km"> km '+[100,500,1000,2000,5000].map(k=>'<button type="button" data-km="'+k+'">'+k.toLocaleString()+'</button>').join("")+'</div>':'')+
  (GEO.mode==="lineup"?'<input type="search" class="gfk-lus" placeholder="Type a city, e.g. Rome" list="gfkLuList"><datalist id="gfkLuList">'+cities().slice(0,1200).map(c=>'<option value="'+esc(c.n)+'">').join("")+'</datalist><div class="gfk-lu"></div>':'')+
  '<div class="gfk-cols">'+GCOLS.map(c=>'<button type="button" data-gc="'+c+'" style="background:'+c+'" class="'+(c===GEO.col?"on":"")+'" aria-label="Colour"></button>').join("")+'</div>'+
  '<div class="gfk-selbar" hidden></div>'+
  '<div class="gfk-acts"><button type="button" data-act="undo" title="Ctrl+Z">Undo</button><button type="button" data-act="redo" title="Ctrl+Y">Redo</button><button type="button" data-act="more" title="Outline, fill, arrows, text, your shapes and more">More settings…</button></div>',true);if(!p)return;
 p.querySelectorAll("[data-gm]").forEach(b=>b.onclick=()=>{const m=b.dataset.gm;if(m===GEO.mode){GEO.mode=null;capture(false);if(m==="ruler"&&S.place.ruler)putAway("ruler")}else GEO.mode=m;geoSave();geoPanel()});
 geoList();
 p.querySelectorAll("[data-gc]").forEach(b=>b.onclick=()=>{GEO.col=b.dataset.gc;geoSave();p.querySelectorAll("[data-gc]").forEach(x=>x.classList.toggle("on",x===b));const s=K().ink[GEO.sel];if(s){s.c=GEO.col;save();render();geoList()}});
 const ki=p.querySelector(".gfk-km input");if(ki){ki.onchange=()=>{GEO.km=Math.max(1,Math.min(20000,+ki.value||1000));geoSave()};p.querySelectorAll("[data-km]").forEach(b=>b.onclick=()=>{GEO.km=+b.dataset.km;ki.value=GEO.km;geoSave()})}
 const ls=p.querySelector(".gfk-lus");if(ls)ls.onchange=()=>{const v=ls.value.trim().toLowerCase(),c=cities().find(x=>x.n.toLowerCase()===v)||cities().find(x=>x.n.toLowerCase().startsWith(v));if(c){lineUp(c.ll,c.n);try{amGlobe.rot=[-c.ll[0],-c.ll[1]];amGlobe.request?amGlobe.request():amGlobe.render()}catch(e){}}};
 p.querySelector('[data-act="undo"]').onclick=undoGeo;p.querySelector('[data-act="redo"]').onclick=redoGeo;p.querySelector('[data-act="more"]').onclick=()=>{const m=document.getElementById("gfkGeoMore");if(m)m.remove();else geoMore()};
 
 if(!M||GEO.mode==="select"){capture(false);return}
 if(GEO.mode==="ruler"){capture(false);if(!S.place.ruler){const h=host();if(h){const r=h.getBoundingClientRect();dropTool("ruler",r.left+r.width*.5,r.top+r.height*.8)}}else measure(true);return}
 if(S.pen){S.pen=null;sync()}pinArm(false);
 let a=null,A=null;capture(true,"crosshair",{
  down:e=>{const hit=geoHit(e.clientX,e.clientY,"handles");if(hit){a=null;geoDrag(hit,e);return}if(GEO.sel>=0){GEO.sel=-1;GEO.sels=[];geoList()}
   a=[e.clientX,e.clientY];A=toLL(e.clientX,e.clientY);if(!A){a=null;return}{const sn=GEO.mode!=="lineup"&&GEO.mode!=="text"&&snapAt(e.clientX,e.clientY);if(sn){A=sn.ll;a=sn.q}}
   if(GEO.mode==="text"){keep({t:"geoText",c:GEO.col,p:[A.slice(),A.slice()],tx:"Text",fs:14,g:{m:"text",A:A.slice()}});GEO.mode="select";geoSave();GEO._focusText=true;GEO.sel=K().ink.length-1;GEO.sels=[GEO.sel];geoPanel();render();a=null;return}if(GEO.mode==="ring"){const o=ringAt(A);o.g={m:"ring",A,km:GEO.km};keep(o);geoSelect(K().ink.length-1);a=null}else if(GEO.mode==="lineup"){lineUp(A);a=null}},
  move:e=>{if(!a)return;const B=toLL(e.clientX,e.clientY);if(!B)return;const o=shape(GEO.mode,a,[e.clientX,e.clientY],e.shiftKey,A,B);S.stroke=o?{t:"geo",c:GEO.col,p:o.p}:null;render()},
  up:e=>{if(!a)return;S.stroke=null;const B=toLL(e.clientX,e.clientY);if(B&&Math.hypot(e.clientX-a[0],e.clientY-a[1])>5){const o=shape(GEO.mode,a,[e.clientX,e.clientY],e.shiftKey,A,B);if(o){o.g={m:GEO.mode,A,B,sh:e.shiftKey?1:0,tru:GEO.tru?1:0};keep(o);geoSelect(K().ink.length-1)}}a=null;render()}});
 /* closing the set puts the drawing tool away */
 clearInterval(geoPanel._t);geoPanel._t=setInterval(()=>{if(!document.getElementById("gfkGeo")){clearInterval(geoPanel._t);GEO.sel=-1;if(!S.pen)capture(false);render()}},400)}
/* the chosen shape: a halo and its handles */
function selDraws(){try{if(!document.getElementById("gfkGeo"))return[];const ink=K().ink;return selList().map(i=>ink[i]).filter(Boolean)}catch(e){return[]}}
function selDraw(){try{if(GEO.sel<0||!document.getElementById("gfkGeo"))return null;const s=K().ink[GEO.sel];return s||null}catch(e){return null}}
{const st=document.createElement("style");st.textContent=`#gfkGeo{width:min(400px,calc(100vw - 24px))}.gfk-looks{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}.gfk-looks button{width:28px;height:28px;border-radius:8px;border:1px solid #d9cdb8;background:#fffaf0;font-size:14px;cursor:pointer;padding:0;line-height:1}.gfk-looks button.on{background:#2f6fb0;color:#fff;border-color:#2f6fb0}.gfk-stk button{font-size:15px}.gfk-geom{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:6px 0}.gfk-geom button{border:1px solid #d9cdb8;background:#fffaf0;border-radius:10px;padding:6px 2px;font:700 11px system-ui;color:#4a3520;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px}.gfk-geom button i{font-style:normal;font-size:16px}.gfk-geom button.on{background:#2f6fb0;border-color:#2f6fb0;color:#fff}
.gfk-geom button i svg{display:block}#gfkGeo .gfk-chk{display:block}#gfkGeo .gfk-chk small{display:block;margin-left:22px;opacity:.7}.gfk-selbar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0 4px;padding:7px 9px;border-radius:10px;background:rgba(47,111,176,.12)}.gfk-selbar[hidden]{display:none}#gfkGeo .gfk-selbar input[data-tx]{flex:1;min-width:90px;width:auto}#gfkGeo .gfk-selbar button{border:1px solid #c9bda6;background:#fffaf0;border-radius:8px;font:700 11px system-ui;padding:3px 8px;margin:0;color:#4a3520;box-shadow:none;min-height:0;cursor:pointer}#gfkGeo .gfk-selbar .gfk-del{color:#b3261e}.gfk-more{width:min(300px,calc(100vw - 24px))}.gfk-more .gfk-sbrow{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:5px 0}.gfk-more .gfk-fmtt{margin:4px 0 2px;font-weight:800}.gfk-hr{border:0;border-top:1px solid rgba(0,0,0,.1);margin:8px 0}.gfk-more .gfk-chk{display:flex;flex-wrap:wrap;align-items:center;gap:2px 6px;margin:4px 0}.gfk-more .gfk-chk small{flex-basis:100%;opacity:.7}body.dark-theme .gfk-panel .gfk-seg,body.sky-night .gfk-panel .gfk-seg{border-color:#3a4a66;background:#25304a}body.dark-theme .gfk-panel .gfk-seg button,body.sky-night .gfk-panel .gfk-seg button,body.dark-theme .gfk-panel .gfk-sbacts button,body.sky-night .gfk-panel .gfk-sbacts button,body.dark-theme #gfkGeo .gfk-selbar button,body.sky-night #gfkGeo .gfk-selbar button{background:#25304a;color:#e6edf7;border-color:#3a4a66}body.dark-theme .gfk-panel .gfk-seg button.on,body.sky-night .gfk-panel .gfk-seg button.on{background:#4f8fdc;color:#fff}body.dark-theme .gfk-panel .gfk-del,body.sky-night .gfk-panel .gfk-del{color:#ff9a8f !important}.gfk-sbrow{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.gfk-sl{font:800 10px system-ui;letter-spacing:.05em;text-transform:uppercase;opacity:.65;min-width:52px}#gfkGeo .gfk-selbar{gap:5px;padding:6px 8px}.gfk-panel .gfk-seg{display:inline-flex;border:1px solid #c9bda6;border-radius:8px;overflow:hidden;background:#fffaf0}.gfk-panel .gfk-seg button{border:0;border-right:1px solid #e0d6c3;border-radius:0;background:#fffaf0;font:700 11px system-ui;padding:3px 8px;margin:0;cursor:pointer;color:#4a3520;box-shadow:none;min-height:0;line-height:1.3}.gfk-panel .gfk-seg button:last-child{border-right:0}.gfk-panel .gfk-seg button.on{background:#2f6fb0;color:#fff}.gfk-more .gfk-sbrow input[data-tx]{flex:1;min-width:110px;width:auto;padding:3px 7px}.gfk-panel .gfk-sbacts button{border:1px solid #c9bda6;background:#fffaf0;border-radius:8px;font:700 11px system-ui;padding:3px 8px;margin:0;cursor:pointer;color:#4a3520;box-shadow:none;min-height:0}.gfk-panel .gfk-sbacts .gfk-del{color:#b3261e}#gfkGeo .gfk-selbar .gfk-hint{margin:2px 0 0;font-size:11px}.gfk-selbar input{width:76px;font:inherit;padding:2px 6px;border-radius:7px;border:1px solid #ccb}.gfk-selbar .gfk-sp{flex:1}.gfk-selbar button{border:0;border-radius:999px;padding:3px 11px;background:#c8281c;color:#fff;font:700 12px system-ui;cursor:pointer}.gfk-selbar .gfk-hint{flex-basis:100%;margin:0}
.gfk-shapes ul{list-style:none;margin:2px 0 6px;padding:0;max-height:132px;overflow:auto}.gfk-shapes li{display:flex;align-items:center;gap:7px;padding:3px 6px;border-radius:8px;cursor:pointer}.gfk-shapes li:hover{background:rgba(127,127,127,.12)}.gfk-shapes li.on{background:rgba(47,111,176,.2)}.gfk-shapes li i{width:11px;height:11px;border-radius:50%;flex:none}.gfk-shapes li span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}.gfk-shapes li small{opacity:.65;font-weight:500}.gfk-shapes li button{border:0;background:none;color:inherit;opacity:.55;font-size:17px;line-height:1;cursor:pointer;padding:0 3px}.gfk-shapes li button:hover{opacity:1;color:#c8281c}
.gfk-km{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:4px 0}.gfk-km input{width:80px;font:inherit;padding:3px 6px;border-radius:8px;border:1px solid #ccb}.gfk-km button{border:1px solid #d9cdb8;background:#fff;border-radius:999px;padding:2px 8px;font:600 11px system-ui;cursor:pointer}
.gfk-cols{display:flex;gap:6px;margin:8px 0}.gfk-cols button{width:20px;height:20px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #bbb;cursor:pointer}.gfk-cols button.on{box-shadow:0 0 0 2px #1d1b18}
.gfk-lus{width:100%;box-sizing:border-box;font:inherit;padding:6px 10px;border-radius:999px;border:1px solid #ccb;margin:4px 0}.gfk-lu p{margin:6px 0 2px;font-size:13px}.gfk-lul{margin:0;padding-left:18px;font-size:12.5px;columns:2}.gfk-lul small{opacity:.6}`;document.head.appendChild(st)}
/* one button to clear every drawing (pens and geometry) — shown beside the toolkit's tab only while there is something drawn */
setInterval(()=>{try{const t=S.tray;if(!t||!t.isConnected)return;let b=t.querySelector(".gfk-clearall");const n=K().ink.length,show=n>0&&!(typeof ps!=="undefined"&&ps);
 if(!show){if(b)b.remove();return}if(!b){b=document.createElement("button");b.type="button";b.className="gfk-clearall";b.title="Remove every drawing and shape from the map";b.innerHTML="✕ Clear drawings";
  ["pointerdown","mousedown","click"].forEach(ev=>b.addEventListener(ev,e=>e.stopPropagation()));
  b.onclick=()=>{if(!K().ink.length)return;if(!confirm("Clear all your drawings and shapes from the map?"))return;hist();K().ink=[];GEO.sel=-1;GEO.sels=[];save();render();geoList();toast("Drawings cleared. Undo in the Geometry set brings them back")};t.appendChild(b)}}catch(e){}},700);
{const st=document.createElement("style");st.textContent=`.gfk-clearall{position:absolute;left:148px;top:2px;z-index:2;border:1px solid rgba(0,0,0,.12);background:rgba(255,250,240,.95);color:#8a2a1a;border-radius:999px;padding:3px 10px;font:700 11.5px system-ui;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18);white-space:nowrap}.gfk-clearall:hover{background:#fff}.gfk-tray.closed .gfk-clearall{left:132px}body.dark-theme .gfk-clearall,body.sky-night .gfk-clearall{background:#1d2638;color:#ff9a8f;border-color:#3a4a66}`;document.head.appendChild(st)}
})();
