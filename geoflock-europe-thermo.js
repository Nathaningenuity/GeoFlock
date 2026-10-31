/* GeoFlock: three tour-stop touches.
   1. Europe, "Where Europe ends": the whole of geographic Europe gets one soft tint (every European country, plus
      European Russia, western Kazakhstan, East Thrace and the parts of Georgia and Azerbaijan north of the Caucasus crest),
      matching the dashed boundary the stop already draws. It reuses the tour engine's "poly + land" lines, which fill a
      polygon clipped to the land of the listed countries: one entry for the countries wholly in Europe (a wide box that
      stays clear of Africa, Madeira, the Canaries, Ceuta and Melilla), and the stop's own two entries for the countries the
      boundary splits (Russia's reaching north now to Novaya Zemlya and Franz Josef Land, and south of Crimea).
      Cyprus is left out: geographically it lies on the Asian side, south of Turkey. Iceland and Svalbard are in.
   2. Antarctica, "Sail into a volcano": a red thermometer at the warm beach of Pendulum Cove, inside Deception Island's
      caldera. No number: no well-sourced figure for the bathing water was found (expedition reports only say the
      seeping water is hot enough to scald feet and is mixed with ~2 °C bay water to a comfortable warmth).
   3. Europe, "Europe’s highest mountain": Mont Blanc gets a photo pin again (the original stop pinned it), using the
      library photo "Mont Blanc Massif (2022-08-16).jpg" (Olgierd Rudak, CC BY-SA 4.0), and the second Elbrus photo pin,
      added by geoflock-polish-l.js, is dropped (the stop's original "Mount Elbrus 5,642 m" pin stays).
   Patched by tour id and stop title; the flag sits on each steps array. */
(function(){
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const stopOf=(id,title)=>{try{const t=PS_TOURS[id];return t&&Array.isArray(t.steps)?t.steps.find(s=>s&&strip(s.title)===title):null}catch(e){return null}};
/* points every `step` degrees along a run of [lon,lat] vertices, so long edges follow parallels, not great circles */
const dense=(pts,step)=>{const o=[];for(let i=0;i<pts.length-1;i++){const[a0,b0]=pts[i],[a1,b1]=pts[i+1],n=Math.max(1,Math.ceil(Math.max(Math.abs(a1-a0),Math.abs(b1-b0))/(step||1)));for(let k=0;k<n;k++)o.push([+(a0+(a1-a0)*k/n).toFixed(3),+(b0+(b1-b0)*k/n).toFixed(3)])}o.push(pts[pts.length-1]);return o};

/* ---------- 1. Where Europe ends ---------- */
const EU_WHOLE=["is","no","sj","se","fi","ax","dk","fo","gb","ie","im","je","gg","nl","be","lu","de","fr","mc","ad","es","gi","pt",
 "it","va","sm","mt","ch","li","at","si","hr","ba","rs","me","xk","al","mk","gr","bg","ro","md","tdr","ua","by","pl","cz","sk","hu","lt","lv","ee"];
/* the box: north of Madeira, the Canaries, Ceuta and Melilla (the edge runs through the Strait of Gibraltar between Ceuta
   and the Rock), east to 45°E (no country in the list reaches that far); only land of the listed countries is filled */
const EU_BOX=dense([[-35,34.5],[-6.2,34.5],[-6.2,35.95],[-1.8,35.95],[-1.8,33.8],[45,33.8],[45,85],[-35,85],[-35,34.5]],1);
/* the countries the boundary splits: the stop's own line, from the Kara Sea down the Urals, the Ural River, the Caspian
   and the Caucasus crest, closed round through the Black Sea (south of Crimea) and the Arctic (taking in Novaya Zemlya
   and Franz Josef Land) */
const RU_POLY=[[69,73],[66.5,70.5],[65,68.6],[60,64.5],[59.4,61.5],[59.2,58.5],[58.6,55.5],[58.6,52.4],[55,51.4],[51.5,51],[51.4,48],
 [51.9,46.9],[50.5,45.5],[49.2,44.2],[48.6,41.6],[46.5,41.9],[44.6,42.8],[42.5,43.2],[40,43.6],[37.5,45],[36.6,43.9],[33,43.6],
 [29.5,43.4],[20,44]].concat(dense([[10,44],[10,83],[70.5,83],[70.5,76.5],[69,73]],2));
function europe(){const s=stopOf("europe","Where Europe ends");if(!s||(Array.isArray(s.lines)&&s.lines.some(l=>l&&l._gfEu)))return;
 const L=Array.isArray(s.lines)?s.lines:[];
 const out=[{poly:EU_BOX,kind:"outline",land:EU_WHOLE,_gfEu:1}];
 L.forEach(l=>{if(l&&l._gfEu)return;
  if(l&&l.poly&&Array.isArray(l.land)&&l.land.includes("ru"))out.push(Object.assign({},l,{poly:RU_POLY}));else out.push(l)});
 def(s,"lines",out)}

/* ---------- 2. Sail into a volcano: a thermometer on the warm beach ---------- */
const THERMO='<g class="gf-thermo"><path d="M9.6 15.2V4.4a2.4 2.4 0 0 1 4.8 0v10.8a4.6 4.6 0 1 1-4.8 0z" fill="#fff" stroke="#7d1d1d" stroke-width="1.3" stroke-linejoin="round"/>'+
 '<rect x="11.05" y="4" width="1.9" height="13" rx=".95" fill="currentColor"/><circle cx="12" cy="18.9" r="3.1" fill="currentColor"/>'+
 '<path d="M14.4 6.6h1.6M14.4 9.4h1.6M14.4 12.2h1.6" stroke="#7d1d1d" stroke-width="1.1" stroke-linecap="round"/></g>';
function thermoIcon(){try{if(typeof PS_ICONS!=="undefined"&&!PS_ICONS.gfThermo)PS_ICONS.gfThermo=THERMO}catch(e){}
 if(!document.getElementById("gfThermoCss")){const st=document.createElement("style");st.id="gfThermoCss";
  st.textContent=".ps-ip:has(.gf-thermo){width:30px;height:30px}.ps-ip .gf-thermo{filter:none}";document.head.appendChild(st)}}
function volcano(){const s=stopOf("antarctica","Sail into a volcano");if(!s)return;thermoIcon();
 const P=Array.isArray(s.iconPins)?s.iconPins:[];if(P.some(q=>q&&q.icon==="gfThermo"))return;
 /* Pendulum Cove, the bathing beach on the caldera's north-east shore (62.93°S, 60.60°W); drawn a little north-east of
    it so it sits clear of the island's own pin and of the Neptune's Bellows photo, which lean the other way */
 def(s,"iconPins",P.concat([{at:[-60.2,-62.75],icon:"gfThermo",col:"#d62828"}]))}

/* ---------- 3. Europe's highest mountain: Mont Blanc's photo, one Elbrus photo ---------- */
const MB_LABEL="Mont Blanc · 4,806 m",MB_FILE="Mont Blanc Massif (2022-08-16).jpg";
function montBlanc(){const s=stopOf("europe","Europe’s highest mountain");if(!s||typeof PS_PHOTO_DATA==="undefined")return;
 const i=PS_PHOTO_DATA.findIndex(x=>x&&x.f===MB_FILE&&x.d);
 try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};if(i>=0)PS_SQ_IMG[MB_LABEL]=i}catch(e){}
 const cur=Array.isArray(s.phPins)?s.phPins:[];
 const hasMB=cur.some(q=>q&&q.label===MB_LABEL),dup=cur.some(q=>q&&strip(q.label)==="Elbrus, in the Caucasus");
 if(hasMB&&!dup)return;if(i<0&&!dup)return;
 let next=cur.filter(q=>q&&strip(q.label)!=="Elbrus, in the Caucasus").map(q=>Object.assign({},q));
 if(!hasMB&&i>=0)next.push({at:[6.865,45.833],label:MB_LABEL,col:"#d9682b",icon:"photo",_gfImg:i});
 def(s,"phPins",next);def(s,"_polLd",1);def(s,"_sqPruned",-1)}

function run(){try{europe()}catch(e){console.error(e)}try{volcano()}catch(e){console.error(e)}try{montBlanc()}catch(e){console.error(e)}}
const go=()=>{setTimeout(run,1500);[3000,6500,13500].forEach(ms=>setTimeout(run,ms))};
if(document.readyState==="complete")go();else window.addEventListener("load",go);
})();
