/* GeoFlock: Culture map › Language areas. Where each language is spoken, after Asher & Moseley (eds.), Atlas of the World's Languages
   (2nd ed., Routledge 2007), digitised by Glottography (CC BY 4.0); families from Glottolog (CC BY 4.0). Each family has its own colour and
   each language a lighter or darker shade of it; hover for the language. Areas are generalised: cities, overlaps and people living abroad
   mostly don't show, and a language area is not an ethnic or political boundary. */
(function(){
if(typeof ALLMAPS_SUBMODES==="undefined"||typeof TH_THEMES==="undefined"||typeof d3==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* hidden for now (an ethnic-groups map is planned in its place); set window.GF_SHOW_LAREA=true to bring the tab back */
if(!window.GF_SHOW_LAREA){try{if(allMapsSubMode.culture==="larea")allMapsSubMode.culture="lang"}catch(e){}}
if(window.GF_SHOW_LAREA&&!ALLMAPS_SUBMODES.culture.some(s=>s.id==="larea")){const i=ALLMAPS_SUBMODES.culture.findIndex(s=>s.id==="lang");ALLMAPS_SUBMODES.culture.splice(i+1,0,{id:"larea",label:"Language areas"})}
const on=()=>{try{return appMode==="allmaps"&&allMapsColorMode==="culture"&&allMapsSubMode.culture==="larea"}catch(e){return false}};
/* family colours: the big families get fixed, well-separated colours (matching the Languages map where they overlap) */
const FIX={"Indo-European":"#e8a07a","Niger-Congo":"#8fcf9e","Atlantic-Congo":"#8fcf9e","Afro-Asiatic":"#d9b26b","Sino-Tibetan":"#e07b6f","Austronesian":"#d58fb8","Turkic":"#6fc0c0",
 "Uralic":"#a6d8e8","Dravidian":"#b4561f","Austroasiatic":"#c3a27c","Tai-Kadai":"#efb7a0","Kra-Dai":"#efb7a0","Japonic":"#c96f8f","Koreanic":"#9b5fa8","Nilo-Saharan":"#5ea77a",
 "Central Sudanic":"#5ea77a","Nilotic":"#4f9a6e","Mongolic":"#7fa7dc","Mongolic-Khitan":"#7fa7dc","Tungusic":"#9fb4e0","Pama-Nyungan":"#c9a46b","Uto-Aztecan":"#7fb8a8","Mayan":"#5fa596",
 "Quechuan":"#8fc7b8","Arawakan":"#6aa88f","Tupian":"#9bd1a5","Algic":"#88a6c9","Eskimo-Aleut":"#b9d4e6","Na-Dene":"#8db0d6","Athabaskan-Eyak-Tlingit":"#8db0d6","Otomanguean":"#6fb39b",
 "Nuclear Trans New Guinea":"#c7b07a","Kartvelian":"#b38bd6","Nakh-Daghestanian":"#9c7cc9","Abkhaz-Adyge":"#a78fd3","Hmong-Mien":"#e0a0a0","Khoe-Kwadi":"#d6c08a","Isolate":"#a9a39a","Unclassified":"#bdb6a6"};
const EXTRA=["#7fc6d9","#d9a0c6","#a8c66f","#e0b56f","#9aa8e0","#c98f8f","#8fd1c0","#d1c08f","#b08fd1","#8fb08f","#d18fa8","#8fa8b0"];
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=k>0?(c=>c+(255-c)*k):(c=>c*(1+k));return"#"+[r,g,b].map(c=>Math.round(Math.max(0,Math.min(255,f(c)))).toString(16).padStart(2,"0")).join("")}
let FAM=null,FC=null,GROUPS=null,BOX=null,loading=null,focus=null;
const famCol={};function colOf(f){if(famCol[f])return famCol[f];const c=FIX[f]||EXTRA[hash(f)%EXTRA.length];return famCol[f]=c}
TH_THEMES.larea={title:"Language areas",cats:[],data:{},info:{},note:"Where each language is spoken. Each family has its own colour, each language a shade of it. Hover for the language."};
function load(){if(loading)return loading;loading=Promise.all([fetch("textures/LANG_AREAS.json").then(r=>r.json()),fetch("textures/LANG_FAMILIES.json").then(r=>r.json()).catch(()=>null)]).then(([fc,fams])=>{
 FC=fc;const feats=fc.features.filter(f=>f.geometry);
 /* the legend: families by area; the small ones folded into "Other families" */
 const area={};feats.forEach(f=>{const a=d3.geoArea(f);area[f.properties.f]=(area[f.properties.f]||0)+(a>2*Math.PI?0:a)});
 const order=Object.keys(area).sort((a,b)=>area[b]-area[a]),top=order.filter(f=>f!=="Isolate"&&f!=="Unclassified").slice(0,18);FAM={order,top:new Set(top)};
 TH_THEMES.larea.cats=top.map(f=>[f,f,colOf(f)]).concat([["_other","Other families and isolates","#bdb6a6"]]);
 /* each language gets a shade of its family's colour; languages are grouped by colour so each colour is one fill */
 const by=new Map();BOX=[];feats.forEach(f=>{const p=f.properties,base=FAM.top.has(p.f)?colOf(p.f):"#bdb6a6",k=((hash(p.g||p.n)%9)-4)*.07,c=shade(base,k);p._c=c;p._k=FAM.top.has(p.f)?p.f:"_other";
  let g=by.get(c);if(!g){g={type:"FeatureCollection",features:[],c,k:p._k};by.set(c,g)}g.features.push(f);BOX.push([d3.geoBounds(f),f])});
 GROUPS=[...by.values()];redraw();legend()}).catch(e=>{console.error(e);loading=null});return loading}
function redraw(){try{amGlobe&&amGlobe.request?amGlobe.request():amGlobe.render()}catch(e){}try{applyAllMapsColorMode(document.getElementById("allMapsWrap"))}catch(e){}}
function legend(){try{if(on()&&typeof thLegendSync==="function")thLegendSync()}catch(e){}}
/* the countries go plain; the language areas are painted over them in multiply, so borders and labels still show through */
{const _c=allMapsColorForCode;allMapsColorForCode=function(code){if(on())return code==="aq"?"#ffffff":"#f6f2ea";return _c.apply(this,arguments)}}
if(typeof GlobeView!=="undefined"){const P=GlobeView.prototype,_dm=P._drawMeasure;P._drawMeasure=function(ctx,p){try{if(typeof amGlobe!=="undefined"&&this===amGlobe&&on()){if(!GROUPS)load();else{const path=d3.geoPath(p,ctx);ctx.save();ctx.globalCompositeOperation="multiply";
 GROUPS.forEach(g=>{if(focus&&g.k!==focus)return;ctx.fillStyle=g.c;ctx.beginPath();path(g);ctx.fill()});
 if(hov){ctx.globalCompositeOperation="source-over";ctx.strokeStyle="#1d2433";ctx.lineWidth=1.6;ctx.beginPath();path(hov);ctx.stroke()}ctx.restore()}}}catch(e){console.error(e)}return _dm.apply(this,arguments)}}
/* which language is under the pointer */
let hov=null;function langAt(ll){if(!BOX||!ll)return null;let best=null,ba=Infinity;for(const [b,f] of BOX){const w=b[0][0]<=b[1][0];if(w?(ll[0]<b[0][0]||ll[0]>b[1][0]):(ll[0]<b[0][0]&&ll[0]>b[1][0]))continue;if(ll[1]<b[0][1]||ll[1]>b[1][1])continue;
 if(focus&&f.properties._k!==focus)continue;if(d3.geoContains(f,ll)){const a=d3.geoArea(f);if(a<ba){ba=a;best=f}}}return best}
const tip=document.createElement("div");tip.className="gf-la-tip";tip.hidden=true;document.body.appendChild(tip);
const css=document.createElement("style");css.textContent=`.gf-la-tip{position:fixed;z-index:9000;pointer-events:none;background:#1d2433;color:#fff;border-radius:10px;padding:7px 10px;font:12.5px/1.35 system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.25);max-width:280px}.gf-la-tip b{font-size:13.5px}.gf-la-tip i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}.gf-la-tip small{opacity:.7}
.gf-la-src{font-size:11px;opacity:.7;margin-top:4px}`;document.head.appendChild(css);
let rq=0;addEventListener("pointermove",e=>{if(!on()||!GROUPS){if(!tip.hidden)tip.hidden=true;if(hov){hov=null;redraw()}return}const g=amGlobe;if(!g||!g.host.contains(e.target)||(e.target.closest&&e.target.closest("button,.gfk-tray,.gfk-panel,.gf-xs,.gf-pc"))){tip.hidden=true;return}
 if(rq)return;rq=requestAnimationFrame(()=>{rq=0;const r=g.canvas.getBoundingClientRect();let ll=null;try{ll=g.projection().invert([e.clientX-r.left,e.clientY-r.top])}catch(_){}const f=langAt(ll);
  if(f!==hov){hov=f;try{g.request?g.request():g.render()}catch(_){}}
  if(!f){tip.hidden=true;return}const p=f.properties;tip.innerHTML='<b>'+esc(p.n)+'</b><br><i style="background:'+p._c+'"></i>'+esc(p.f==="Isolate"?"a language isolate (no known relatives)":p.f==="Unclassified"?"family not known":p.f+" family")+(p.m?' <small>· '+esc(p.m)+'</small>':'');
  tip.hidden=false;tip.style.left=Math.min(innerWidth-290,e.clientX+16)+"px";tip.style.top=(e.clientY+14)+"px"})},true);
/* hovering a country in this view shows only the language under the pointer */
document.addEventListener("pointermove",()=>{if(on())document.querySelectorAll(".globe-tip").forEach(t=>{t.style.visibility=tip.hidden?"":"hidden"})},true);
/* the key: click a family to show only it; and where the areas come from */
document.addEventListener("click",e=>{const s=e.target.closest&&e.target.closest("[data-th]");if(!s||!on())return;setTimeout(()=>{try{focus=typeof thFocus!=="undefined"?thFocus:null}catch(_){focus=null}redraw()},0)},true);
if(typeof thLegendHTML==="function"){const _l=thLegendHTML;thLegendHTML=function(){const h=_l.apply(this,arguments);try{if(on()){if(!GROUPS){load();return'<div class="legend-note">Loading language areas…</div>'}
 return h+'<div class="legend-note gf-la-src">Language areas after Asher &amp; Moseley (eds.), <i>Atlas of the World’s Languages</i> (2nd ed., 2007), digitised by Glottography (CC BY 4.0); families from Glottolog. Generalised: cities, mixed areas and people living abroad mostly don’t show. Not ethnic or political borders.</div>'}}catch(e){}return h}}
setInterval(()=>{if(on()&&!loading)load();if(!on()){focus=null;if(!tip.hidden)tip.hidden=true}},500);
})();
