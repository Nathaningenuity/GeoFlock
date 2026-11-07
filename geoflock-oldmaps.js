/* GeoFlock: Old maps, a slide deck inside Projections. How people drew the world, from a Babylonian clay tablet to the
   Blue Marble: one map per slide, large, with who made it, when, what it shows and what to look for. World maps can be
   compared with today's world by dragging a slider across them. A strip of thumbnails along the bottom jumps between
   maps; ← and → step through. Stops of the "History of the World in Twelve Maps" book tour can open the deck at their map.
   The pictures are Wikimedia Commons scans (public domain or free licences), credited on each slide. */
(function(){
"use strict";
const NOW="textures/oldmaps_now.webp";
/* f: the library picture (by its Commons name); x: an extra picture downloaded for the deck (GF_OLDMAP_PHOTOS); world: a
   whole-world map that can be laid over today's map */
const SLIDES=[
 {id:"babylon",year:"about 600 BC",title:"The Babylonian map of the world",who:"Unknown scribe, Babylon",f:"Baylonianmaps.JPG",stop:"The world on a clay tablet",
  text:"The oldest known map of the world is a clay tablet the size of a hand. Babylon sits in the middle, on the Euphrates, with a ring of ‘bitter river’ (the ocean) round the known lands and triangles of far-off islands beyond.",
  look:["Babylon: the rectangle across the middle","The ring of ocean around the world","The triangles: lands beyond the sea, where heroes went"]},
 {id:"ptolemy",year:"about AD 150 (drawn 1482)",title:"Ptolemy’s world",who:"Claudius Ptolemy, Alexandria; this copy printed in Ulm",x:"ptolemy",stop:"Ptolemy’s Geography",
  text:"Ptolemy listed about 8,000 places by latitude and longitude, so maps could be drawn from numbers. His book was lost to Europe for a thousand years, then rediscovered around 1400.",
  look:["Lines of latitude and longitude: the first grid","The Indian Ocean closed in by land to the south","No Americas, and Asia stretched far too wide"],world:1},
 {id:"idrisi",year:"1154",title:"Al-Idrisi’s map for King Roger",who:"Muhammad al-Idrisi, Palermo",x:"idrisi",stop:"Al-Idrisi’s map for a Norman king",
  text:"Working for the Christian king of Sicily, the Muslim scholar al-Idrisi gathered travellers’ reports into the best world map of its time. South is at the top, as on many Arab maps.",
  look:["South at the top: turn your head to find the Mediterranean","Arabia and the Indian Ocean in great detail","Seven climates, bands running from west to east"]},
 {id:"hereford",year:"about 1300",title:"The Hereford Mappa Mundi",who:"Richard of Haldingham, England",f:"Hereford-Karte.jpg",stop:"The Hereford Mappa Mundi",
  text:"Drawn on a single calfskin, the Hereford map is a picture of faith as much as of places: Jerusalem is at the centre, the Garden of Eden at the top, and the world is full of Bible stories and monsters.",
  look:["East at the top, with the Garden of Eden","Jerusalem, a circle at the very centre","Britain squeezed into the bottom-left edge"]},
 {id:"catalan",year:"1375",title:"The Catalan Atlas",who:"Attributed to Abraham Cresques, Majorca",x:"catalan",f:"Catalan Atlas BNF Sheet 6 Mansa Musa.jpg",
  text:"Made by a Jewish mapmaker in Majorca for the king of France, it mixes sailors’ charts with travellers’ tales. In West Africa sits Mansa Musa of Mali, holding a nugget of gold.",
  look:["Mansa Musa with his golden orb","Compass roses and lines for sailors (portolan lines)","Caravans crossing to China along the Silk Road"]},
 {id:"kangnido",year:"1402",title:"The Kangnido",who:"Kim Sa-hyeong, Yi Mu and Yi Hoe, Korea",x:"kangnido",stop:"The Kangnido: a Korean view of the world",
  text:"Made in Korea from Chinese and Islamic maps, the Kangnido shows Europe, Arabia and Africa decades before Portuguese sailors rounded Africa.",
  look:["China huge in the middle, Korea drawn large","Africa as a triangle with the sea to its south","Hundreds of European place names"]},
 {id:"waldseemuller",year:"1507",title:"Waldseemüller names America",who:"Martin Waldseemüller, Saint-Dié",f:"Waldseemuller map 2.jpg",stop:"Waldseemüller names America",
  text:"The first map to use the name ‘America’, after the explorer Amerigo Vespucci. Only one printed copy survives; the US Library of Congress bought it in 2003 for 10 million dollars.",
  look:["‘America’ written on the southern continent","A thin new land with the Pacific already behind it","Ptolemy’s old Asia on the right"],world:1},
 {id:"ribeiro",year:"1529",title:"Ribeiro divides the globe",who:"Diogo Ribeiro, Seville",f:"Map Diego Ribero 1529.jpg",stop:"Diogo Ribeiro divides the globe",
  text:"After Magellan’s voyage, Spain and Portugal split the world between them. Ribeiro’s map shows the Pacific at its true, enormous size for the first time.",
  look:["The wide Pacific, only just measured","The flags of Spain and Portugal on either side of the dividing line","South America’s coast nearly right; North America barely begun"],world:1},
 {id:"mercator",year:"1569",title:"Mercator’s map for sailors",who:"Gerard Mercator, Duisburg",f:"Mercator 1569 world map composite.jpg",stop:"Mercator’s map for sailors",
  text:"Mercator stretched his map more and more towards the poles so that a line of constant compass bearing is straight. Sailors loved it; it is also why Greenland looks as big as Africa.",
  look:["The grid: lines spread out towards the top and bottom","A huge imaginary southern continent","Greenland drawn far too large"],world:1},
 {id:"hondius",year:"1630",title:"A Dutch world for sale",who:"Henricus Hondius, Amsterdam",f:"Nova totius Terrarum Orbis geographica ac hydrographica tabula (Hendrik Hondius) balanced.jpg",stop:"Blaeu: maps for money",
  text:"In the 1600s Amsterdam became the world’s map shop. Rival families such as Hondius and Blaeu sold beautiful atlases to merchants who wanted to see where their ships went.",
  look:["The four elements and the seasons in the corners","California drawn as an island","Australia only half drawn: its west coast"],world:1},
 {id:"cassini",year:"1756–1815",title:"The Cassini map of France",who:"Four generations of the Cassini family",x:"cassini",stop:"The Cassinis measure France",
  text:"The first map of a whole country drawn from a network of measured triangles. When it showed France smaller than thought, Louis XV is said to have joked that his astronomers had lost him more land than his enemies.",
  look:["Every village, abbey and windmill","Hills drawn as fine hatching","No colours: a survey, not a picture"]},
 {id:"mackinder",year:"1904",title:"Mackinder’s heartland",who:"Halford Mackinder, London",x:"mackinder",stop:"Mackinder’s heartland",
  text:"Mackinder argued that whoever ruled the vast inner plains of Eurasia, out of reach of sea power, could rule the world. The idea shaped strategy through both world wars and the Cold War.",
  look:["The ‘pivot area’ in the middle of Eurasia","An inner crescent of coastal lands","An outer crescent of islands and seas"]},
 {id:"peters",year:"1973",title:"The Peters projection",who:"Arno Peters (after James Gall, 1855)",f:"Gall–Peters projection SW.jpg",stop:"The Peters projection",
  text:"An equal-area map that showed Africa and South America at their true size, sold as a fairer map of the world. Its shapes are badly stretched, which started a famous argument among mapmakers.",
  look:["Africa tall and narrow, but the right size","Europe small and squashed","Every area true; every shape a little wrong"],world:1},
 {id:"bluemarble",year:"1972 / 2002",title:"The whole Earth from space",who:"NASA",f:"Blue Marble 2002.png",stop:"Google Earth",
  text:"The first photos of the whole Earth showed what no map can: a ball with no edges and no borders. Today satellite mosaics like this one are the base of Google Earth and of this app’s Satellite map.",
  look:["No borders at all","Clouds over the oceans and the Equator","The real colours of forests and deserts"]}
];
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
function photo(S){try{const X=window.GF_OLDMAP_PHOTOS||{};if(S.x&&X[S.x])return X[S.x];if(typeof gfMergeExtra==="function")gfMergeExtra();if(S.f){const P=PS_PHOTO_DATA.find(p=>p&&p.f===S.f&&p.d);if(P)return P}}catch(e){}return null}
const src=P=>{try{return typeof gfSrc==="function"?gfSrc(P.d):P.d}catch(e){return P.d}};
let D=null;
function slides(){return SLIDES.filter(S=>photo(S))}
function open(at){const L=slides();if(!L.length)return;let k=Math.max(0,L.findIndex(S=>S.id===at||S.stop===at));if(k<0)k=0;
 close();const el=document.createElement("div");el.className="gfom";el.setAttribute("role","dialog");el.setAttribute("aria-label","Old maps");document.body.appendChild(el);D={el,L,k,cmp:false};render();
 el.addEventListener("click",e=>{if(e.target===el)close()})}
function close(){if(D){D.el.remove();D=null}}
function render(){const{el,L,k}=D,S=L[k],P=photo(S);
 el.innerHTML='<div class="gfom-box"><div class="gfom-top"><b>📜 Old maps</b><span>'+(k+1)+' of '+L.length+'</span><button type="button" class="gfom-x" aria-label="Close">×</button></div>'+
  '<div class="gfom-main"><div class="gfom-pic'+(D.cmp?' cmp':'')+'"><div class="gfom-stage"><img class="gfom-old" alt="'+esc(S.title)+'" src="'+esc(src(P))+'">'+(D.cmp?'<div class="gfom-now" style="--x:50%"><img alt="Today’s world" src="'+NOW+'"></div><input type="range" class="gfom-sl" min="0" max="100" value="50" aria-label="Compare with today">':'')+'</div>'+
   '<button type="button" class="gfom-nav prev" aria-label="Previous"'+(k?'':' disabled')+'>‹</button><button type="button" class="gfom-nav next" aria-label="Next"'+(k<L.length-1?'':' disabled')+'>›</button></div>'+
   '<div class="gfom-txt"><small>'+esc(S.year)+'</small><h3>'+esc(S.title)+'</h3><em>'+esc(S.who)+'</em><p>'+esc(S.text)+'</p><b class="gfom-lk">Look for</b><ul>'+S.look.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>'+
   (S.world?'<button type="button" class="gfom-cmpb">'+(D.cmp?"Hide today’s map":"Compare with today’s world")+'</button>':'')+
   '<div class="gfom-cr">'+esc(P.by||"")+(P.lic?' · '+esc(P.lic):"")+'</div></div></div>'+
  '<div class="gfom-strip">'+L.map((T,i)=>{const Q=photo(T);return'<button type="button" data-i="'+i+'" class="'+(i===k?'on':'')+'" title="'+esc(T.title)+'"><img alt="" loading="lazy" src="'+esc(src(Q))+'"><span>'+esc(T.year.replace(/^about /,"c. "))+'</span></button>'}).join("")+'</div></div>';
 el.querySelector(".gfom-x").onclick=close;el.querySelector(".prev").onclick=()=>go(-1);el.querySelector(".next").onclick=()=>go(1);
 el.querySelectorAll(".gfom-strip button").forEach(b=>b.onclick=()=>{D.k=+b.dataset.i;D.cmp=false;render()});
 const cb=el.querySelector(".gfom-cmpb");if(cb)cb.onclick=()=>{D.cmp=!D.cmp;render()};
 const sl=el.querySelector(".gfom-sl");if(sl)sl.oninput=()=>el.querySelector(".gfom-now").style.setProperty("--x",sl.value+"%");
 /* compare: the stage takes the old map's own shape, fitted into the space */
 if(D.cmp){const im=el.querySelector(".gfom-old"),st=el.querySelector(".gfom-stage"),pic=el.querySelector(".gfom-pic");const fit=()=>{const r=im.naturalWidth/im.naturalHeight||2,W=pic.clientWidth-20,H=pic.clientHeight-20;let w=W,h=W/r;if(h>H){h=H;w=H*r}st.style.width=w+"px";st.style.height=h+"px"};if(im.complete)fit();else im.onload=fit}
 const on=el.querySelector(".gfom-strip .on");if(on)on.scrollIntoView({block:"nearest",inline:"center"})}
function go(d){if(!D)return;const k=D.k+d;if(k<0||k>=D.L.length)return;D.k=k;D.cmp=false;render()}
document.addEventListener("keydown",e=>{if(!D)return;if(e.key==="Escape"){close();e.preventDefault()}else if(e.key==="ArrowRight"){go(1);e.preventDefault()}else if(e.key==="ArrowLeft"){go(-1);e.preventDefault()}},true);
/* the button in Projections */
/* a chip like the projections', in brown, at the end of their row */
function addButton(){const row=document.querySelector("#projView #projChips")||document.querySelector("#projView .proj-chips");if(!row||row.querySelector(".gfom-open"))return;
 document.querySelectorAll("#projView .proj-switches .gfom-open").forEach(x=>x.remove());
 const b=document.createElement("button");b.type="button";b.className="chip gfom-open";b.title="Old maps: how people drew the world, from 600 BC to today";b.textContent="📜 Old maps";
 b.addEventListener("click",e=>{e.stopPropagation();open()});row.appendChild(b)}
setInterval(addButton,1200);
/* the Twelve Maps book tour: a button on its map stops */
function tourBtn(){try{if(typeof ps==="undefined"||!ps||ps.tour!=="b12maps"||!ps.card)return;const S=psSteps()[ps.i],sl=SLIDES.find(x=>x.stop===S.title);if(!sl||!photo(sl)||ps.card.querySelector(".gfom-tb"))return;
 const b=document.createElement("button");b.type="button";b.className="gfom-tb";b.textContent="📜 Look at this map";b.onclick=()=>open(sl.id);const t=ps.card.querySelector(".ps-stat")||ps.card.querySelector(".ps-title");if(t&&t.parentNode)t.parentNode.insertBefore(b,t.nextSibling);else ps.card.appendChild(b)}catch(e){}}
setInterval(tourBtn,700);
window.gfOldMaps={open,close,SLIDES};
{const s=document.createElement("style");s.textContent=`
#projChips .chip.gfom-open,.proj-chips .chip.gfom-open{background:#7a4f24!important;color:#fff6e6!important;border-color:#5e3b18!important}#projChips .chip.gfom-open:hover,.proj-chips .chip.gfom-open:hover{background:#8d5d2c!important}
.gfom-tb{display:block;margin:8px 0;border:0;border-radius:999px;padding:7px 14px;font-weight:800;background:#7a4f24;color:#fff6e6;cursor:pointer}
.gfom{position:fixed;inset:0;z-index:3000;background:rgba(20,14,8,.72);display:flex;align-items:center;justify-content:center;padding:14px}
.gfom-box{width:min(1240px,100%);height:min(820px,100%);display:flex;flex-direction:column;background:#f6ecd8;color:#2a2014;border-radius:18px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.5)}
.gfom-top{display:flex;align-items:center;gap:12px;padding:10px 16px;background:#3d2a16;color:#f6ecd8}.gfom-top span{opacity:.75;font-size:13px}.gfom-x{margin-left:auto;border:0;background:none;color:#f6ecd8;font-size:26px;line-height:1;cursor:pointer}
.gfom-main{flex:1;display:flex;min-height:0}
.gfom-pic{position:relative;flex:1.7;min-width:0;background:#2a1e12;display:flex;align-items:center;justify-content:center;overflow:hidden}
.gfom-pic img.gfom-old{max-width:100%;max-height:100%;object-fit:contain}
.gfom-stage{position:relative;display:flex;align-items:center;justify-content:center;max-width:100%;max-height:100%}.gfom-pic:not(.cmp) .gfom-stage{width:100%;height:100%}
.gfom-pic.cmp img.gfom-old{width:100%;height:100%;object-fit:fill}
.gfom-now{position:absolute;inset:0;clip-path:inset(0 calc(100% - var(--x)) 0 0)}.gfom-now img{width:100%;height:100%;object-fit:fill}
.gfom-now::after{content:"";position:absolute;top:0;bottom:0;left:var(--x);width:3px;margin-left:-1.5px;background:#fff;box-shadow:0 0 6px rgba(0,0,0,.6)}
.gfom-sl{position:absolute;left:10%;right:10%;bottom:14px;z-index:3}
.gfom-nav{position:absolute;top:50%;margin-top:-24px;width:44px;height:48px;border:0;border-radius:12px;background:rgba(246,236,216,.88);color:#3d2a16;font-size:30px;line-height:1;cursor:pointer;z-index:4}.gfom-nav.prev{left:10px}.gfom-nav.next{right:10px}.gfom-nav:disabled{opacity:.25;cursor:default}
.gfom-txt{flex:1;min-width:260px;max-width:400px;padding:18px 20px;overflow:auto}.gfom-txt small{color:#a0522d;font-weight:800;text-transform:uppercase;letter-spacing:.05em}
.gfom-txt h3{margin:4px 0 2px;font-size:22px;line-height:1.2}.gfom-txt em{display:block;color:#7a5a3a;font-size:13.5px;margin-bottom:10px}.gfom-txt p{font-size:15px;line-height:1.5;margin:0 0 12px}
.gfom-lk{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#7a5a3a}.gfom-txt ul{margin:6px 0 14px;padding-left:18px;font-size:14.5px;line-height:1.45}
.gfom-cmpb{border:0;border-radius:999px;padding:8px 14px;font-weight:800;background:#2f6f8f;color:#fff;cursor:pointer}
.gfom-cr{margin-top:14px;font-size:11.5px;color:#8a7458}
.gfom-strip{display:flex;gap:8px;overflow-x:auto;padding:10px 12px;background:#e9dcc2}.gfom-strip button{flex:0 0 auto;width:92px;border:2px solid transparent;border-radius:10px;padding:0 0 3px;background:#fff8ea;cursor:pointer;color:#3d2a16}
.gfom-strip button.on{border-color:#a0522d}.gfom-strip img{width:100%;height:56px;object-fit:cover;border-radius:8px 8px 0 0;display:block}.gfom-strip span{font-size:11px;font-weight:700}
@media (max-width:760px){.gfom-main{flex-direction:column}.gfom-pic{flex:1.2}.gfom-txt{max-width:none}}`;document.head.appendChild(s)}
})();
