/* GeoFlock: the Nature map. Tabs: Biomes (the 14 RESOLVE biomes over the relief), Ecoregions (about a hundred famous
   ones), Ocean realms (Marine Ecoregions of the World), Human footprint, and country measures (forest cover, forest
   change since 1990, protected land) drawn like the People map. Click a biome, ecoregion or realm for its card.
   Data: geoflock-nature-data.js (GF_NATURE). Sources: RESOLVE Ecoregions 2017 (Dinerstein et al., CC BY 4.0) and others
   listed in that file. */
(function(){
if(typeof renderAllMapsView!=="function"||typeof d3==="undefined"||typeof TH_THEMES==="undefined")return;
const N=window.GF_NATURE;if(!N||!N.biomes)return;
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const NS="http://www.w3.org/2000/svg";
const CARD={};(N.cards||[]).forEach(c=>CARD[c.b]=c);
const colB=b=>(CARD[b]&&CARD[b].col)||"#bbb";
const REALM_COL=N.realmCols||{};
const FOOT=N.footClasses||[[0,"Wild (almost untouched)","#3f8f5a"],[1,"Lightly used","#b7d48a"],[2,"Farmed and grazed","#f0c060"],[3,"Heavily changed (cities, intensive farms)","#c4472a"]];
const VEC=new Set(["biomes","eco","realms","footprint"]);

/* ---------- the map and its tabs ---------- */
ALLMAPS_SUBMODES.nature=[{id:"biomes",label:"Biomes"},{id:"eco",label:"Ecoregions"},{id:"realms",label:"Ocean realms"},{id:"footprint",label:"Human footprint"},{id:"forest",label:"Forest cover"},{id:"forestchg",label:"Forest change"},{id:"protected",label:"Protected land"}].filter(s=>VEC.has(s.id)?(s.id==="eco"?N.eco:s.id==="realms"?N.realms:s.id==="footprint"?N.footprint:true):TH_THEMES[s.id]);
allMapsSubMode.nature="biomes";
try{ALLMAPS_MODE_DEFAULTS.nature={rivers:false,cities:false,landforms:false}}catch(e){}
try{ALLMAPS_LAKES_DEFAULT.nature=true}catch(e){}
ALLMAPS_GLOBE_MODES.add("nature");ALLMAPS_HOVER_MODES.add("nature");
try{TOUR_MAPNAME.nature="Nature map"}catch(e){}
try{if(window.GF_MAIN_SUBS)GF_MAIN_SUBS.nature=["biomes","eco","footprint","protected","forest"]}catch(e){}
try{allMapsResetModeSwitches()}catch(e){}
const vecOn=()=>{try{return allMapsColorMode==="nature"&&VEC.has(allMapsSubMode.nature)}catch(e){return false}};
/* country measures use the colour-category system; the drawn tabs sit on the relief picture */
{const has=TH_MODES.has;TH_MODES.has=function(m){if(m==="nature")return!vecOn()&&!!TH_THEMES[allMapsSubMode.nature];return has.call(this,m)}}
try{Object.defineProperty(ALLMAPS_RASTER_MODES,"nature",{get(){return vecOn()?"#allMapsReliefLayer":undefined},enumerable:true,configurable:true})}catch(e){}

function wrapEl(){return document.getElementById("allMapsWrap")}
function addButton(){const row=document.getElementById("allMapsToggleRow");if(!row||row.querySelector('[data-allmaps-mode="nature"]'))return;
 const after=row.querySelector('[data-allmaps-mode="people"]')||row.querySelector('[data-allmaps-mode="culture"]');if(!after)return;
 const b=document.createElement("button");b.className="chip";b.dataset.allmapsMode="nature";b.textContent="Nature Map";after.after(b);
 b.onclick=()=>{const w=wrapEl();allMapsColorMode="nature";document.querySelectorAll("#allMapsView [data-allmaps-mode]").forEach(x=>x.classList.toggle("active",x===b));
  try{allMapsLoadModeSwitches();applyCityVisibility(w,allMapsCitiesOn);renderAllMapsSubModes(w);applyAllMapsColorMode(w)}catch(e){console.error(e)}}}
/* the globe shows the relief picture under the drawn tabs */
function patchGlobe(){try{if(typeof amGlobe==="undefined"||!amGlobe||amGlobe._gfNat)return;for(const k of Object.keys(amGlobe)){const o=amGlobe[k];if(o&&typeof o==="object"&&typeof o.raster==="function"){const _r=o.raster;o.raster=function(){return vecOn()?"relief":_r.apply(this,arguments)};const _f=o.fill;if(_f)o.fill=function(){return vecOn()?null:_f.apply(this,arguments)};amGlobe._gfNat=1;break}}}catch(e){}}

/* ---------- what is drawn ---------- */
let focus=null;/* a biome or footprint class picked in the legend */
function feats(){const t=allMapsSubMode.nature;
 if(t==="biomes")return(N.biomes.features||[]).map(f=>({f,col:colB(f.properties.b),op:focus==null||focus===f.properties.b?.72:.12,kind:"biome",id:f.properties.b}));
 if(t==="eco"){const base=(N.biomes.features||[]).map(f=>({f,col:colB(f.properties.b),op:.16,kind:"biome",id:f.properties.b,faint:1}));
  return base.concat((N.eco||[]).map(e=>({f:{type:"Feature",geometry:e.geom,properties:{}},col:colB(e.b),op:.85,kind:"eco",id:e.id,line:1})))}
 if(t==="realms")return(N.realms.features||[]).map(f=>({f,col:REALM_COL[f.properties.r]||"#7fb3d5",op:focus==null||focus===f.properties.r?.62:.12,kind:"realm",id:f.properties.r}));
 if(t==="footprint")return(N.footprint.features||[]).map(f=>({f,col:(FOOT.find(c=>c[0]===f.properties.k)||[0,0,"#999"])[2],op:focus==null||focus===f.properties.k?.86:.1,kind:"foot",id:f.properties.k}));
 return[]}
const P=()=>typeof GLOBE_ROBINSON!=="undefined"?GLOBE_ROBINSON:d3.geoRobinson().scale(318.31).translate([1e3,500.5]);
let sig="";
function drawFlat(force){const w=wrapEl(),svg=w&&w.querySelector(":scope > svg");if(!svg)return;let g=svg.querySelector(":scope > g.gf-nature");
 if(!vecOn()||(typeof appMode!=="undefined"&&appMode!=="allmaps")){if(g)g.remove();sig="";return}
 const s=allMapsSubMode.nature+"|"+focus;if(g&&!force&&s===sig)return;sig=s;
 if(!g){g=document.createElementNS(NS,"g");g.setAttribute("class","gf-nature");g.setAttribute("data-spin","no")}
 /* just above the relief picture, under borders and labels */
 const relief=svg.querySelector("#allMapsReliefLayer");if(relief){if(relief.nextSibling!==g)relief.after(g)}else if(g.parentNode!==svg)svg.insertBefore(g,svg.firstChild);
 const path=d3.geoPath(P());let h="";
 feats().forEach(x=>{const d=path(x.f);if(!d)return;h+='<path d="'+d+'" style="fill:'+(x.line?x.col:x.col)+';fill-opacity:'+x.op+(x.line?";stroke:#fff;stroke-width:1.6;stroke-opacity:1;paint-order:stroke":";stroke:none")+'"/>'});
 g.innerHTML=h}
function globe(){try{if(typeof amGlobe!=="undefined"&&amGlobe)amGlobe.request?amGlobe.request():amGlobe.render()}catch(e){}}
if(typeof GlobeView!=="undefined"){const _dm=GlobeView.prototype._drawMeasure;GlobeView.prototype._drawMeasure=function(ctx,p){
 try{if(vecOn()&&typeof amGlobe!=="undefined"&&this===amGlobe){const path=d3.geoPath(p,ctx);ctx.save();
  feats().forEach(x=>{ctx.beginPath();path(x.f);ctx.globalAlpha=Math.min(.8,x.op*.95);ctx.fillStyle=x.col;ctx.fill();if(x.line){ctx.globalAlpha=.9;ctx.strokeStyle="#fff";ctx.lineWidth=1;ctx.stroke()}});ctx.restore()}}catch(e){console.error(e)}return _dm.apply(this,arguments)}}

/* ---------- what is under the pointer ---------- */
const boxes=new WeakMap;
function inside(f,ll){let b=boxes.get(f);if(!b){b=d3.geoBounds(f);boxes.set(f,b)}const[[x0,y0],[x1,y1]]=b;if(ll[1]<y0-.01||ll[1]>y1+.01)return false;if(x0<=x1&&(ll[0]<x0-.01||ll[0]>x1+.01))return false;return d3.geoContains(f,ll)}
function hit(ll){if(!ll)return null;const t=allMapsSubMode.nature;
 if(t==="eco"){const e=(N.eco||[]).find(e=>{e._f=e._f||{type:"Feature",geometry:e.geom};return inside(e._f,ll)});if(e)return{kind:"eco",d:e}}
 if(t==="biomes"||t==="eco"){const f=(N.biomes.features||[]).find(f=>inside(f,ll));return f?{kind:"biome",d:CARD[f.properties.b]||{n:f.properties.n,b:f.properties.b}}:null}
 if(t==="realms"){const f=(N.realms.features||[]).find(f=>inside(f,ll));return f?{kind:"realm",d:Object.assign({n:f.properties.r},(N.realmCards||{})[f.properties.r]||{})}:null}
 if(t==="footprint"){const f=(N.footprint.features||[]).find(f=>inside(f,ll));if(!f)return null;const c=FOOT.find(c=>c[0]===f.properties.k);return{kind:"foot",d:{n:c?c[1]:""}}}
 return null}
function llAt(cx,cy){try{const onGlobe=typeof amGlobeOn==="function"&&amGlobeOn();if(!onGlobe)return typeof amtToLL==="function"?amtToLL(cx,cy):null;
  const r=amGlobe.host.getBoundingClientRect(),pr=amGlobe.projection();const ll=pr.invert&&pr.invert([cx-r.left,cy-r.top]);if(!ll)return null;const c=[-amGlobe.rot[0],-amGlobe.rot[1]];return d3.geoDistance(ll,c)<Math.PI/2?ll:null}catch(e){return null}}
let tip=null,lastXY=null,raf=0;
function tipShow(h,x,y){if(!tip){tip=document.createElement("div");tip.className="gf-nat-tip";document.body.appendChild(tip)}tip.innerHTML=h;tip.style.display="block";const w=tip.offsetWidth;tip.style.left=Math.min(innerWidth-w-8,x+14)+"px";tip.style.top=(y+16)+"px"}
function tipHide(){if(tip)tip.style.display="none"}
document.addEventListener("pointermove",e=>{if(!vecOn()||document.querySelector(".gf-nat-back")){if(tip&&tip.style.display!=="none")tipHide();return}const t=e.target;const over=t&&t.closest&&t.closest("#allMapsWrap, #amGlobeHost");if(!over||t.closest(".gf-ly-pt,.am-tools,#gfKit,.ps-launcher,button")){tipHide();return}
 lastXY=[e.clientX,e.clientY];if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(!lastXY)return;const h=hit(llAt(lastXY[0],lastXY[1]));if(!h){tipHide();return}
  const d=h.d,sub=h.kind==="biome"?"Biome":h.kind==="eco"?"Ecoregion · "+((CARD[d.b]||{}).n||""):h.kind==="realm"?"Ocean realm":"Human footprint";tipShow("<small>"+esc(sub)+"</small><b>"+esc(d.n)+"</b>"+(h.kind!=="foot"?"<em>Click to learn more</em>":""),lastXY[0],lastXY[1])})},{passive:true});
document.addEventListener("pointerleave",tipHide);
let down=null;document.addEventListener("pointerdown",e=>{down=[e.clientX,e.clientY]},true);
/* clicking opens the card for what is there (instead of the country) */
const _oz=openFlagZoom;openFlagZoom=function(){try{if(vecOn()&&typeof appMode!=="undefined"&&appMode==="allmaps"&&down&&!(typeof ps!=="undefined"&&ps)){const h=hit(llAt(down[0],down[1]));if(h&&h.kind!=="foot"){card(h);return}if(h)return}}catch(e){console.error(e)}return _oz.apply(this,arguments)};
document.addEventListener("click",e=>{if(!vecOn()||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const t=e.target;if(!t.closest||!t.closest("#allMapsWrap > svg, #amGlobeHost")||t.closest("path[data-code],path[id],.gf-ly-pt"))return;
 /* in the sea (no country under the pointer) */
 const h=hit(llAt(e.clientX,e.clientY));if(h&&h.kind!=="foot")card(h)});

/* ---------- cards ---------- */
function photo(p){if(!p)return"";const src=typeof p==="string"?p:p.d;if(!src)return"";return'<figure class="gf-nat-fig"><img class="gf-nat-photo" src="'+esc(src)+'" alt="" loading="lazy">'+(p.by?'<figcaption>Photo: '+(p.page?'<a href="'+esc(p.page)+'" target="_blank" rel="noopener">':"")+esc(p.by)+(p.page?"</a>":"")+(p.lic?", "+esc(p.lic):"")+"</figcaption>":"")+"</figure>"}
function chips(a){return a&&a.length?'<div class="gf-nat-chips">'+a.map(x=>"<span>"+esc(x)+"</span>").join("")+"</div>":""}
function card(h){tipHide();document.querySelectorAll(".gf-nat-back").forEach(x=>x.remove());const d=h.d;let body="";
 if(h.kind==="biome"){const stats=[];if(d.share!=null)stats.push(d.share+"% of Earth’s land");if(d.protected!=null)stats.push(d.protected+"% protected");
  body='<small>Biome</small><h3>'+esc(d.n)+"</h3>"+(d.full&&d.full!==d.n?'<p class="gf-nat-sub">'+esc(d.full)+"</p>":"")+photo(d.photo)+chips(stats)+"<p>"+esc(d.blurb||"")+"</p>"+(d.intact?'<p class="gf-nat-intact">'+esc(d.intact)+"</p>":"")+
   (d.animals&&d.animals.length?"<h4>Famous animals</h4>"+chips(d.animals):"")+(d.plants&&d.plants.length?"<h4>Famous plants</h4>"+chips(d.plants):"")+(d.where?'<p class="gf-nat-where"><b>Where:</b> '+esc(d.where)+"</p>":"")}
 else if(h.kind==="eco"){const B=CARD[d.b]||{},stats=[];if(d.km2)stats.push(Math.round(d.km2).toLocaleString()+" km²");if(B.n)stats.push(B.n);const NNH={1:"Half or more is protected",2:"Nature could still recover to half",3:"Needs restoring to recover",4:"Nature imperiled: little natural land left"};if(NNH[d.nnh])stats.push(NNH[d.nnh]);
  body='<small>Ecoregion</small><h3>'+esc(d.n)+"</h3>"+photo(d.photo)+chips(stats)+"<p>"+esc(d.blurb||"")+"</p>"+(d.animals&&d.animals.length?"<h4>Famous animals</h4>"+chips(d.animals):"")+(d.plants&&d.plants.length?"<h4>Famous plants</h4>"+chips(d.plants):"")}
 else if(h.kind==="realm"){body='<small>Ocean realm</small><h3>'+esc(d.n)+"</h3>"+photo(d.photo)+"<p>"+esc(d.blurb||"")+"</p>"+(d.animals&&d.animals.length?"<h4>Famous animals</h4>"+chips(d.animals):"")}
 const o=document.createElement("div");o.className="game-modal-backdrop gf-nat-back";o.innerHTML='<div class="game-modal gf-nat-card" role="dialog"><button class="modal-x" type="button" aria-label="Close">×</button>'+body+'<p class="gf-nat-credit">'+esc(N.credit||"")+"</p></div>";
 document.body.appendChild(o);const close=()=>o.remove();o.querySelector(".modal-x").onclick=close;o.addEventListener("click",e=>{if(e.target===o)close()});document.addEventListener("keydown",function k(e){if(e.key==="Escape"){close();document.removeEventListener("keydown",k)}})}
window.gfNatureCard=card;

/* ---------- legend ---------- */
let rank=null;/* "intact" | "converted" */
function legend(){const t=allMapsSubMode.nature;
 if(t==="biomes"){const list=(N.cards||[]).slice();let rows;
  if(rank){const key=rank==="intact"?(c=>-(c.intactPct!=null?c.intactPct:100-(c.convertedPct||0))):(c=>-(c.convertedPct!=null?c.convertedPct:0));rows=list.filter(c=>c.convertedPct!=null||c.intactPct!=null).sort((a,b)=>key(a)-key(b)).map((c,i)=>'<span class="legend-swatch gf-nat-sw" data-nb="'+c.b+'"><i style="background:'+c.col+'"></i>'+(i+1)+". "+esc(c.n)+"<em>"+(rank==="intact"?(c.intactPct!=null?c.intactPct:100-c.convertedPct)+"% natural":c.convertedPct+"% converted")+"</em></span>").join("")}
  else rows=list.map(c=>'<span class="legend-swatch gf-nat-sw'+(focus===c.b?" is-on":"")+'" data-nb="'+c.b+'" role="button" tabindex="0"><i style="background:'+c.col+'"></i>'+esc(c.n)+(c.share!=null?"<em>"+c.share+"%</em>":"")+"</span>").join("");
  return'<span class="legend-title">Biomes</span><span class="gf-nat-rank"><button type="button" data-rank=""'+(rank?"":' class="on"')+'>All biomes</button><button type="button" data-rank="intact"'+(rank==="intact"?' class="on"':"")+'>Most intact</button><button type="button" data-rank="converted"'+(rank==="converted"?' class="on"':"")+'>Most converted</button></span><span class="legend-swatches th-swatches">'+rows+'</span><span class="legend-note">A biome is a big kind of natural home, shaped by climate: rainforest, desert, tundra… Numbers show each biome’s share of Earth’s land. Click a colour to show only that biome, or click the map for its card.'+(focus!=null?' <a href="#" class="gf-nat-clear">Show all</a>':"")+" "+esc(N.credit||"")+"</span>"}
 if(t==="eco")return'<span class="legend-title">Famous ecoregions</span><span class="legend-note">'+(N.eco||[]).length+" of the world’s 846 ecoregions — areas with their own mix of plants and animals — outlined in white and coloured by biome. Hover or click one to learn about it. "+esc(N.credit||"")+"</span>";
 if(t==="realms"){const R=Object.keys(REALM_COL);return'<span class="legend-title">Ocean realms</span><span class="legend-swatches th-swatches">'+R.map(r=>'<span class="legend-swatch gf-nat-sw'+(focus===r?" is-on":"")+'" data-nr="'+esc(r)+'" role="button" tabindex="0"><i style="background:'+REALM_COL[r]+'"></i>'+esc(r)+"</span>").join("")+'</span><span class="legend-note">The coastal seas split into twelve big realms, each with its own sea life. Click the sea for a realm’s card. '+esc(N.realmCredit||"")+"</span>"}
 if(t==="footprint")return'<span class="legend-title">Human footprint</span><span class="legend-swatches th-swatches">'+FOOT.map(c=>'<span class="legend-swatch gf-nat-sw'+(focus===c[0]?" is-on":"")+'" data-nf="'+c[0]+'" role="button" tabindex="0"><i style="background:'+c[2]+'"></i>'+esc(c[1])+"</span>").join("")+'</span><span class="legend-note">How much people have changed the land: cities, farms, roads, mines and power lines. Green areas are still wild. '+esc(N.footCredit||"")+"</span>";
 return""}
{const _lg=allMapsLegendHTML;allMapsLegendHTML=function(){if(vecOn())return legend();return _lg.apply(this,arguments)}}
document.addEventListener("click",e=>{if(!vecOn())return;const t=e.target;if(!t.closest||!t.closest("#populationLegend"))return;
 const r=t.closest("[data-rank]");if(r){e.preventDefault();rank=r.dataset.rank||null;focus=null;refresh();return}
 if(t.closest(".gf-nat-clear")){e.preventDefault();focus=null;refresh();return}
 const s=t.closest(".gf-nat-sw");if(!s)return;const v=s.dataset.nb!=null?+s.dataset.nb:s.dataset.nf!=null?+s.dataset.nf:s.dataset.nr;
 if(rank&&s.dataset.nb!=null){const c=CARD[v];if(c)card({kind:"biome",d:c});return}focus=focus===v?null:v;refresh()});
function refresh(){try{const w=wrapEl();applyAllMapsColorMode(w)}catch(e){}drawFlat(true);globe()}

const st=document.createElement("style");st.textContent=`
#allMapsWrap g.gf-nature path{ pointer-events:none; }
.gf-nat-tip{ position:fixed; z-index:9999; pointer-events:none; background:rgba(16,28,48,.94); color:#fff; font-size:12.5px; line-height:1.35; padding:6px 10px; border-radius:9px; box-shadow:0 4px 14px rgba(0,0,0,.25); display:none; max-width:260px; }
.gf-nat-tip small{ display:block; opacity:.7; font-size:11px; }
.gf-nat-tip b{ display:block; font-size:13.5px; }
.gf-nat-tip em{ display:block; opacity:.7; font-size:11px; font-style:normal; margin-top:2px; }
.gf-nat-card{ max-width:480px; text-align:left; max-height:88vh; overflow:auto; }
.gf-nat-card small{ text-transform:uppercase; letter-spacing:.06em; font-weight:800; opacity:.6; font-size:11px; }
.gf-nat-card h3{ margin:2px 0 4px; font-size:23px; }
.gf-nat-card h4{ margin:12px 0 5px; font-size:13px; text-transform:uppercase; letter-spacing:.05em; opacity:.7; }
.gf-nat-sub{ margin:0 0 8px; opacity:.7; font-size:13px; }
.gf-nat-fig{ margin:8px 0; }
.gf-nat-photo{ display:block; width:100%; max-height:240px; object-fit:cover; border-radius:12px; }
.gf-nat-fig figcaption{ font-size:10.5px; opacity:.55; margin-top:3px; }
.gf-nat-fig figcaption a{ color:inherit; }
.gf-nat-chips{ display:flex; flex-wrap:wrap; gap:6px; margin:6px 0; }
.gf-nat-chips span{ background:rgba(47,138,122,.12); border-radius:999px; padding:4px 10px; font-size:12.5px; font-weight:600; }
.gf-nat-intact{ background:rgba(232,112,26,.09); border-radius:10px; padding:8px 10px; font-size:13px; }
.gf-nat-where{ font-size:13px; }
.gf-nat-credit{ font-size:11px; opacity:.55; margin:12px 0 0; }
.gf-nat-rank{ display:flex; gap:6px; flex-wrap:wrap; margin:4px 0 6px; }
.gf-nat-rank button{ border:1px solid rgba(0,0,0,.12); background:#fff; border-radius:999px; padding:4px 10px; font:600 12px/1 inherit; cursor:pointer; color:inherit; }
.gf-nat-rank button.on{ background:var(--accent,#2f8a7a); color:#fff; border-color:transparent; }
body.dark-theme .gf-nat-rank button:not(.on){ background:#1f2b3a; }
`;document.head.appendChild(st);

setInterval(()=>{try{addButton();patchGlobe();drawFlat(false)}catch(e){console.error(e)}},500);
/* tabs change: redraw */
let lastSub=null;setInterval(()=>{let s="";try{s=allMapsColorMode+"|"+allMapsSubMode.nature}catch(e){}if(s!==lastSub){lastSub=s;focus=null;tipHide();drawFlat(true);globe()}},300);
})();
