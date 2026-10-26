/* GeoFlock: printable blank maps and worksheets for classrooms.
   Pick a region (or a country's states/provinces) and a style — blank, numbered with an answer key, or labelled —
   and a clean black-and-white page opens, ready to print. */
(function(){
if(typeof d3==="undefined"||typeof projFeatures!=="function"||typeof COUNTRIES==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* regions: [id, label, which countries are numbered, view box [lon0,lat0,lon1,lat1] or null for the whole world] */
const REG=[
 ["world","The world",c=>true,null],
 ["africa","Africa",c=>c.r==="Africa",[-19,-36,53,38]],
 ["europe","Europe",c=>c.r==="Europe"&&c.c!=="ru",[-25,34,45,71.5]],
 ["asia","Asia",c=>c.r==="Asia",[25,-11,150,56]],
 ["mideast","Middle East",c=>c.s==="Middle East",[25,11,63,43]],
 ["namerica","North and Central America",c=>c.r==="Americas"&&c.s!=="South America",[-170,6,-52,75]],
 ["carib","Central America and the Caribbean",c=>c.s==="Caribbean"||c.s==="Central America",[-93,6.5,-59,27.5]],
 ["samerica","South America",c=>c.s==="South America",[-83,-56,-33,13.5]],
 ["oceania","Oceania",c=>c.r==="Oceania",[110,-48,180,1]]];
function boxPoly(b){const[a,c,d,e]=b,n=24,P=[];for(let i=0;i<=n;i++)P.push([a+(d-a)*i/n,c]);for(let i=0;i<=n;i++)P.push([d,c+(e-c)*i/n]);for(let i=0;i<=n;i++)P.push([d-(d-a)*i/n,e]);for(let i=0;i<=n;i++)P.push([a,e-(e-c)*i/n]);return{type:"Polygon",coordinates:[P.reverse()]}}
/* place labels: start at each shape's visual middle, then nudge away from labels already placed */
function place(items,fs){const done=[];items.forEach(it=>{const w=it.t.length*fs*.56+6,h=fs*1.25;let x=it.x,y=it.y,ok=false;
 for(const[dx,dy]of[[0,0],[0,1],[0,-1],[0,2],[0,-2],[1,0],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1],[0,3],[0,-3]]){const X=it.x+dx*w*.6,Y=it.y+dy*h;if(!done.some(d=>Math.abs(d.x-X)<(d.w+w)/2&&Math.abs(d.y-Y)<(d.h+h)/2)){x=X;y=Y;ok=true;break}}
 it.lx=x;it.ly=y;it.moved=ok&&(x!==it.x||y!==it.y);done.push({x,y,w,h})});return items}
/* the middle of a shape's biggest part, which keeps labels off the sea for countries like Croatia or Indonesia */
function mid(path,f){const g=f.geometry;if(!g)return null;if(g.type==="MultiPolygon"){let best=null,ba=-1;g.coordinates.forEach(p=>{const a=path.area({type:"Polygon",coordinates:p});if(a>ba){ba=a;best=p}});return path.centroid({type:"Polygon",coordinates:best})}return path.centroid(f)}
function build(o){/* o: {kind:"region"|"prov", id, style:"blank"|"numbered"|"labelled", feats, lit, proj, title, noun} */
 const W=o.W,H=o.H,path=d3.geoPath(o.proj),fs=(o.fs||11)*Math.max(W,H)/950;/* bigger pages are shrunk more to fit the paper, so their text starts bigger */let h="";
 if(o.sphere)h+='<path d="'+path({type:"Sphere"})+'" class="sea"/>';
 if(o.grat)h+='<path d="'+path(d3.geoGraticule().step([30,30])())+'" class="grat"/>';
 o.feats.forEach(f=>{const d=path(f);if(d)h+='<path d="'+d+'" class="'+(o.lit(f)?"lit":"other")+'"/>'});
 if(o.sphere)h+='<path d="'+path({type:"Sphere"})+'" class="edge"/>';
 const lab=[];if(o.style!=="blank"){o.feats.filter(o.lit).forEach(f=>{const m=mid(path,f);if(!m||!isFinite(m[0])||m[0]<0||m[0]>W||m[1]<0||m[1]>H)return;lab.push({x:m[0],y:m[1],n:o.name(f),small:path.area(f)<60})})}
 lab.sort((a,b)=>Math.floor(a.y/70)-Math.floor(b.y/70)||a.x-b.x);
 lab.forEach((L,i)=>{L.k=i+1;L.t=o.style==="numbered"?String(i+1):L.n});
 place(lab,o.style==="numbered"?fs*1.35:fs);
 lab.forEach(L=>{if(L.small||L.moved)h+='<circle cx="'+L.x.toFixed(1)+'" cy="'+L.y.toFixed(1)+'" r="1.6" class="dot"/>';if(L.moved)h+='<line x1="'+L.x.toFixed(1)+'" y1="'+L.y.toFixed(1)+'" x2="'+L.lx.toFixed(1)+'" y2="'+L.ly.toFixed(1)+'" class="lead"/>';
  h+='<text x="'+L.lx.toFixed(1)+'" y="'+L.ly.toFixed(1)+'" class="'+(o.style==="numbered"?"num":"lab")+'">'+esc(L.t)+'</text>'});
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">'+h+'</svg>';
 const key=o.style==="numbered"?'<section class="key"><h2>Answer key: '+esc(o.title)+'</h2><ol>'+lab.map(L=>'<li>'+esc(L.n)+'</li>').join("")+'</ol></section>':"";
 const ask=o.style==="blank"?"Label as many "+o.noun+" as you can.":o.style==="numbered"?"Write the name of each numbered "+o.noun.replace(/ies$/,"y").replace(/s$/,"")+".":"Study the "+o.noun+", then try the blank version.";
 const lines=o.style==="numbered"?'<div class="lines">'+lab.map(L=>'<span><b>'+L.k+'</b><i></i></span>').join("")+'</div>':"";
 const land=W>H*1.15;
 return'<!doctype html><html><head><meta charset="utf-8"><title>'+esc(o.title)+' — GeoFlock worksheet</title><style>'+
 '@page{size:A4 '+(land?"landscape":"portrait")+';margin:12mm}*{box-sizing:border-box}body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#111;margin:0;padding:16px;background:#fff}'+
 '.bar{display:flex;gap:10px;align-items:center;margin:0 0 12px;font-size:14px}.bar button{font:inherit;font-weight:700;padding:8px 16px;border-radius:999px;border:0;background:#e8701a;color:#fff;cursor:pointer}'+
 'header{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:2px solid #111;padding-bottom:6px;margin-bottom:8px}header h1{font-size:22px;margin:0}header p{margin:2px 0 0;font-size:13px}'+
 '.who{font-size:13px;white-space:nowrap}.who span{display:inline-block;border-bottom:1px solid #111;width:160px;margin:0 12px 0 4px}'+
 'svg{width:100%;height:auto;max-height:'+(land?"150mm":"215mm")+';display:block}svg path.sea{fill:#fff;stroke:none}svg path.grat{fill:none;stroke:#ccc;stroke-width:.4}svg path.edge{fill:none;stroke:#111;stroke-width:.8}'+
 'svg path.lit{fill:#fff;stroke:#111;stroke-width:.55;stroke-linejoin:round}svg path.other{fill:#e6e6e6;stroke:#999;stroke-width:.4}'+
 'svg text{font-family:system-ui,sans-serif;text-anchor:middle;dominant-baseline:central;paint-order:stroke;stroke:#fff;stroke-width:2.6px;stroke-linejoin:round}svg text.num{font-size:'+(fs*1.35).toFixed(1)+'px;font-weight:800}svg text.lab{font-size:'+fs+'px;font-weight:600}svg .dot{fill:#111}svg .lead{stroke:#111;stroke-width:.4}'+
 '.lines{columns:4;column-gap:18px;margin-top:10px;font-size:12px}.lines span{display:flex;gap:6px;align-items:flex-end;break-inside:avoid;margin:0 0 7px}.lines b{min-width:20px;text-align:right}.lines i{flex:1;border-bottom:1px solid #999;height:14px}'+
 '.key{break-before:page;padding-top:8px}.key h2{font-size:18px;margin:0 0 8px}.key ol{columns:4;column-gap:20px;font-size:12.5px;margin:0;padding-left:26px}.key li{margin:0 0 3px;break-inside:avoid}'+
 'footer{margin-top:8px;font-size:10px;color:#666;display:flex;justify-content:space-between}@media print{.bar{display:none}body{padding:0}}'+
 '</style></head><body><div class="bar"><button onclick="print()">Print</button><span>Tip: choose “Fit to page” if the map is cut off.</span></div>'+
 '<header><div><h1>'+esc(o.title)+'</h1><p>'+esc(ask)+'</p></div><div class="who">Name<span></span>Date<span style="width:90px"></span></div></header>'+svg+lines+
 '<footer><span>'+esc(o.credit||"Outlines: Natural Earth and © OpenStreetMap contributors")+'</span><span>Made with GeoFlock</span></footer>'+key+'</body></html>'}
function regionPage(id,style){const R=REG.find(r=>r[0]===id)||REG[0],F=projFeatures().filter(f=>f.geometry),by=COUNTRY_BY_CODE;
 const lit=f=>{const c=by[f.properties.c];return!!c&&R[2](c)};let proj,W=1400,H=760,sphere=false,grat=false;
 if(!R[3]){proj=d3.geoRobinson().fitExtent([[6,6],[W-6,H-6]],{type:"Sphere"});sphere=true;grat=true}
 else{const b=R[3],cl=(b[0]+b[2])/2,cp=(b[1]+b[3])/2;proj=d3.geoAzimuthalEqualArea().rotate([-cl,-cp]);const bp=boxPoly(b);proj.fitSize([1000,1000],bp);const bb=d3.geoPath(proj).bounds(bp),ar=(bb[1][0]-bb[0][0])/(bb[1][1]-bb[0][1]);
  if(ar>=1){W=1400;H=Math.round(1400/ar)}else{H=1300;W=Math.round(1300*ar)}proj.fitExtent([[6,6],[W-6,H-6]],bp).clipExtent([[0,0],[W,H]])}
 return build({W,H,proj,feats:F,lit,sphere,grat,style,fs:R[3]?12:9,title:(style==="labelled"?"":"")+"Countries of "+R[1].replace(/^The /,"the "),noun:"countries",name:f=>(by[f.properties.c]||{}).n||f.properties.n||"?"})}
function provPage(cc,style){const P=window.gfProvinces;return P.load(cc).then(d=>{const L=(P.LIST.find(x=>x[0]===cc)||[cc,cc,"region"]);let W=1400,H=900;const F=d.items.map(x=>Object.assign(x.f,{_n:x.n}));
 let proj=P.projFor(cc,F,1000,1000);const bb=d3.geoPath(proj).bounds({type:"FeatureCollection",features:F}),ar=(bb[1][0]-bb[0][0])/(bb[1][1]-bb[0][1]);if(ar>=1){W=1400;H=Math.round(1400/ar)}else{H=1300;W=Math.round(1300*ar)}
 proj=P.projFor(cc,F,W,H);const noun=L[2].includes(" or ")?"provinces and territories":L[2]==="state"?"states":L[2]+"s";const place=L[1].replace(/^US states$/,"the United States");
 return build({W,H,proj,feats:F,lit:()=>true,style,fs:F.length>45?10:12,title:(noun[0].toUpperCase()+noun.slice(1))+" of "+place,noun,name:f=>f._n,credit:"Boundaries: Natural Earth"})})}
function openPage(htmlP){const w=window.open("","_blank");if(!w){alert("Your browser blocked the new tab. Allow pop-ups for this site to open the printable page.");return}w.document.write("<p style='font-family:sans-serif'>Making your map…</p>");Promise.resolve(htmlP).then(h=>{w.document.open();w.document.write(h);w.document.close()}).catch(e=>{w.document.body.textContent="Sorry, that map could not be made: "+e})}
/* the chooser */
function dialog(){let d=document.getElementById("gfPrintDlg");if(d){d.hidden=false;return}d=document.createElement("div");d.id="gfPrintDlg";
 const provs=(window.gfProvinces&&gfProvinces.LIST)||[];
 d.innerHTML='<div class="gpd-card" role="dialog" aria-label="Printable maps"><button class="gpd-x" aria-label="Close">×</button><h3>Printable maps</h3><p>Black-and-white worksheets for class or homework.</p>'+
  '<label>Map<select id="gpdWhat"><optgroup label="Countries">'+REG.map(r=>'<option value="r:'+r[0]+'">'+esc(r[1])+'</option>').join("")+'</optgroup>'+(provs.length?'<optgroup label="States and provinces">'+provs.map(p=>'<option value="p:'+p[0]+'">'+esc(p[1])+'</option>').join("")+'</optgroup>':'')+'</select></label>'+
  '<div class="gpd-st"><label><input type="radio" name="gpdSt" value="blank" checked> Blank</label><label><input type="radio" name="gpdSt" value="numbered"> Numbered, with answer key</label><label><input type="radio" name="gpdSt" value="labelled"> Labelled</label></div>'+
  '<button class="chip tut-go" id="gpdGo">Open printable page →</button></div>';
 document.body.appendChild(d);d.onclick=e=>{if(e.target===d||e.target.closest(".gpd-x"))d.hidden=true};
 d.querySelector("#gpdGo").onclick=()=>{const v=d.querySelector("#gpdWhat").value,st=d.querySelector('input[name="gpdSt"]:checked').value;openPage(v.startsWith("p:")?provPage(v.slice(2),st):regionPage(v.slice(2),st))}}
/* entry point: a chip at the end of the Places study region row */
/* the button lives on the Maps page, after Deep Time (it used to push the Places region chips onto a second row) */
const addPrint=()=>{try{const deep=document.getElementById("gfDeepChip");if(!deep||document.getElementById("gfPrintChip"))return;const b=document.createElement("button");b.type="button";b.className="chip";b.id="gfPrintChip";b.textContent="🖨 Printable maps";b.title="Blank maps and worksheets to print";b.onclick=e=>{e.stopPropagation();dialog()};deep.insertAdjacentElement("afterend",b)}catch(e){console.error(e)}};
let pq=0;new MutationObserver(()=>{if(!pq)pq=setTimeout(()=>{pq=0;addPrint()},200)}).observe(document.body,{childList:true,subtree:true});addPrint();
const css=document.createElement("style");css.textContent=`
#gfPrintDlg{ position:fixed; inset:0; z-index:1000; background:rgba(10,20,40,.45); display:flex; align-items:center; justify-content:center; padding:16px; }
#gfPrintDlg[hidden]{ display:none; }
#gfPrintDlg .gpd-card{ position:relative; background:#fff; color:#17222f; border-radius:20px; padding:18px 20px; width:min(420px,100%); box-shadow:0 12px 40px rgba(0,0,0,.3); }
#gfPrintDlg h3{ margin:0 0 2px; } #gfPrintDlg p{ margin:0 0 12px; opacity:.75; font-size:14px; }
#gfPrintDlg label{ display:block; font-weight:700; font-size:14px; margin:0 0 10px; } #gfPrintDlg select{ display:block; width:100%; margin-top:4px; font:inherit; font-weight:500; padding:8px; border-radius:10px; border:1px solid #ccd; }
#gfPrintDlg .gpd-st label{ font-weight:500; display:flex; gap:8px; align-items:center; margin:0 0 6px; }
#gfPrintDlg .gpd-x{ position:absolute; right:12px; top:10px; border:0; background:none; font-size:22px; cursor:pointer; color:inherit; opacity:.6; }
#gfPrintDlg #gpdGo{ margin-top:8px; background:#e8701a !important; color:#fff !important; border-color:transparent !important; font-weight:800; }`;
document.head.appendChild(css);
window.gfPrint={regionPage,provPage,dialog,openPage};
})();
