/* GeoFlock: country outlines with their faraway parts as insets.
   Wherever a country's outline is drawn (the profile's shape slide, the silhouette quizzes, trivia), parts of the country far
   from its main land are no longer left off or drawn far away across an empty sheet: Alaska and Hawaii for the United States,
   the Canaries for Spain, the Azores and Madeira for Portugal, the Galápagos for Ecuador, Easter Island for Chile, Rodrigues
   for Mauritius, the Prince Edward Islands for South Africa, and France's overseas departments (French Guiana, Guadeloupe,
   Martinique, Réunion, Mayotte), which are part of France itself. Dependent territories with their own entry (Puerto Rico,
   Greenland, the Faroes, New Caledonia...) are not added to their mother country.
   How: the country's pieces of land are grouped by distance; the group with the most land is drawn in an equal-area
   projection centred on it; a group stays where it is when it is near (or adds little to the picture, like India's Andaman
   Islands); a far group goes into a small framed box set in the empty space, as near as it can to the direction it really
   lies in. A box is drawn at the main land's scale, made smaller when that would be too big (Alaska) or bigger when it would
   be too small to see (an atoll). Countries without far parts keep their usual outline.
   window.gfOutline.layout(code) gives the drawing's parts and projections, so the provinces can be drawn on top exactly. */
(function(){
"use strict";
if(typeof d3==="undefined")return;
const RKM=6371,R=Math.PI/180;
/* France's overseas departments (separate shapes on the map, but part of France) */
const EXTRA={fr:["gf","gp","mq","re","yt"]};
const feats=()=>{try{return typeof projFeatures==="function"?projFeatures():[]}catch(e){return[]}};
const featOf=(F,c)=>F.find(x=>x&&x.geometry&&String(x.properties&&x.properties.c).toLowerCase()===c);
const polysOf=g=>g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];
const dist=(a,b)=>d3.geoDistance(a,b)*RKM;
function piece(P){const poly={type:"Polygon",coordinates:P};let c,a,rad=0;try{c=d3.geoCentroid(poly);a=d3.geoArea(poly)}catch(e){return null}if(!c||!isFinite(c[0]))return null;
 if(a>2*Math.PI){/* a ring wound the wrong way: the whole globe less the island */P=P.map(r=>r.slice().reverse());return piece(P)}
 const r=P[0],st=Math.max(1,Math.floor(r.length/60));for(let i=0;i<r.length;i+=st)rad=Math.max(rad,dist(c,r[i]));return{P,c,a,rad}}
const CACHE={};
function layout(code){code=String(code||"").toLowerCase();if(CACHE[code]!==undefined)return CACHE[code];const F=feats();if(!F.length)return null;
 const f=featOf(F,code);if(!f)return(CACHE[code]=null);
 let polys=polysOf(f.geometry).slice();(EXTRA[code]||[]).forEach(c=>{const g=featOf(F,c);if(g)polys=polys.concat(polysOf(g.geometry))});
 const pcs=polys.map(piece).filter(Boolean);if(pcs.length<2)return(CACHE[code]=null);
 /* group pieces less than about 420 km apart (the Aleutians stay one chain) */
 /* the gap between two pieces: from their outlines (sampled), checked only when their rough circles come close */
 const smp=p=>p.sm||(p.sm=(()=>{const r=p.P[0],st=Math.max(1,Math.floor(r.length/90)),o=[];for(let i=0;i<r.length;i+=st)o.push(r[i]);return o})());
 const gap=(p,q)=>{const g0=dist(p.c,q.c)-p.rad-q.rad;if(g0>650)return g0;let m=1e9;const A=smp(p),B=smp(q);for(const a of A)for(const b of B){const d=dist(a,b);if(d<m)m=d}return m},par=pcs.map((_,i)=>i),find=i=>par[i]===i?i:(par[i]=find(par[i]));
 for(let i=0;i<pcs.length;i++)for(let j=i+1;j<pcs.length;j++)if(gap(pcs[i],pcs[j])<420)par[find(i)]=find(j);
 const G=new Map();pcs.forEach((p,i)=>{const k=find(i);if(!G.has(k))G.set(k,[]);G.get(k).push(p)});
 let groups=[...G.values()].map(ps=>({ps,a:ps.reduce((s,p)=>s+p.a,0)})).sort((x,y)=>y.a-x.a);if(groups.length<2)return(CACHE[code]=null);
 const centre=ps=>{let X=0,Y=0,Z=0;ps.forEach(p=>{const cl=Math.cos(p.c[1]*R),w=p.a;X+=w*cl*Math.cos(p.c[0]*R);Y+=w*cl*Math.sin(p.c[0]*R);Z+=w*Math.sin(p.c[1]*R)});return[Math.atan2(Y,X)/R,Math.atan2(Z,Math.hypot(X,Y))/R]};
 const fc=ps=>({type:"FeatureCollection",features:ps.map(p=>({type:"Feature",geometry:{type:"Polygon",coordinates:p.P}}))});
 let main=groups[0].ps.slice();const mc=centre(main);let diam=0;main.forEach(p=>{diam=Math.max(diam,2*(dist(mc,p.c)+p.rad))});
 const P0=d3.geoAzimuthalEqualArea().rotate([-mc[0],-mc[1]]).clipAngle(150).scale(1).translate([0,0]),pa0=d3.geoPath(P0);
 const boxArea=ps=>{const b=pa0.bounds(fc(ps));return Math.max(1e-9,(b[1][0]-b[0][0])*(b[1][1]-b[0][1]))};
 const insets=[];groups.slice(1).forEach(g=>{let gp=1e9;g.ps.forEach(p=>main.forEach(q=>{gp=Math.min(gp,gap(p,q))}));
  const grow=boxArea(main.concat(g.ps))/boxArea(main);
  if(gp>Math.max(400,.45*diam)||(gp>500&&grow>1.6))insets.push(g);else main=main.concat(g.ps)});
/* specks far out at sea (an islet of a few km² off a big country) would only be an empty-looking box: left out */
 const totKm=groups.reduce((t,g)=>t+g.a,0)*RKM*RKM;/* small island nations scattered over the ocean (Seychelles, Kiribati) keep their own outline, ringed islands and all */if(totKm<1000)return(CACHE[code]=null);for(let i=insets.length-1;i>=0;i--)if(totKm>20000&&insets[i].a*RKM*RKM<20)insets.splice(i,1);
 if(!insets.length)return(CACHE[code]=null);
 const W=1000,H=700;let shrink=1,placed=null,mainProj=null;
 for(let attempt=0;attempt<5&&!placed;attempt++){const m=40+(1-shrink)*W*.5,mp=d3.geoAzimuthalEqualArea().rotate([-mc[0],-mc[1]]).clipAngle(150).fitExtent([[m,m*H/W],[W-m,H-m*H/W]],fc(main));
  /* where the main land lies, on a coarse grid */
  const GX=100,GY=70,occ=new Uint8Array(GX*GY);try{const cv=document.createElement("canvas");cv.width=GX;cv.height=GY;const x=cv.getContext("2d");x.setTransform(GX/W,0,0,GY/H,0,0);x.beginPath();d3.geoPath(mp,x)(fc(main));x.lineWidth=40;x.strokeStyle="#000";x.fillStyle="#000";x.fill();x.stroke();
   const D=x.getImageData(0,0,GX,GY).data;for(let i=0;i<GX*GY;i++)occ[i]=D[i*4+3]>20?1:0}catch(e){}
  const s0=mp.scale(),out=[];let ok=true;
  insets.slice().sort((a,b)=>b.a-a.a).forEach(g=>{const c=centre(g.ps),ip=d3.geoAzimuthalEqualArea().rotate([-c[0],-c[1]]).clipAngle(150).scale(s0).translate([0,0]);let b=d3.geoPath(ip).bounds(fc(g.ps)),w=b[1][0]-b[0][0],h=b[1][1]-b[0][1];
   const big=Math.max(w/(.3*W),h/(.34*H)),small=Math.max(w,h)/28;let k=1;if(big>1)k=1/big;else if(small<1)k=1/Math.max(small,1e-3);k=Math.min(k,60);
   ip.scale(s0*k);b=d3.geoPath(ip).bounds(fc(g.ps));w=b[1][0]-b[0][0];h=b[1][1]-b[0][1];const pad=10,bw=w+2*pad,bh=h+2*pad;
   /* where it really lies, seen from the main land */
   let t=mp(c);if(!t||!isFinite(t[0])){const d=[c[0]-mc[0],c[1]-mc[1]];t=[W/2+Math.sign(d[0])*W,H/2-Math.sign(d[1])*H]}
   let best=null,bd=1e18;for(let y=4;y+bh<=H-4;y+=8)for(let x=4;x+bw<=W-4;x+=8){
    let hit=false;for(let gy=Math.floor(y*GY/H);gy<=Math.min(GY-1,Math.floor((y+bh)*GY/H))&&!hit;gy++)for(let gx=Math.floor(x*GX/W);gx<=Math.min(GX-1,Math.floor((x+bw)*GX/W));gx++)if(occ[gy*GX+gx]){hit=true;break}
    if(hit)continue;const d=Math.hypot(x+bw/2-t[0],y+bh/2-t[1]);if(d<bd){bd=d;best=[x,y]}}
   if(!best){ok=false;return}
   for(let gy=Math.floor((best[1]-6)*GY/H);gy<=Math.floor((best[1]+bh+6)*GY/H);gy++)for(let gx=Math.floor((best[0]-6)*GX/W);gx<=Math.floor((best[0]+bw+6)*GX/W);gx++)if(gx>=0&&gy>=0&&gx<GX&&gy<GY)occ[gy*GX+gx]=1;
   ip.translate([best[0]+pad-b[0][0],best[1]+pad-b[0][1]]);out.push({g,proj:ip,box:[best[0],best[1],bw,bh],c})});
  if(ok){placed=out;mainProj=mp}else shrink*=.85}
 if(!placed)return(CACHE[code]=null);
 const parts=[{proj:mainProj,ps:main,box:null}].concat(placed.map(o=>({proj:o.proj,ps:o.g.ps,box:o.box})));
 /* the drawing */
 let d="",dots="",bb=[1e9,1e9,-1e9,-1e9];const grow=(x0,y0,x1,y1)=>{bb=[Math.min(bb[0],x0),Math.min(bb[1],y0),Math.max(bb[2],x1),Math.max(bb[3],y1)]};
 parts.forEach(pt=>{const pa=d3.geoPath(pt.proj);pt.ps.forEach(p=>{const ft={type:"Feature",geometry:{type:"Polygon",coordinates:p.P}},b=pa.bounds(ft);if(!isFinite(b[0][0]))return;
   if(b[1][0]-b[0][0]<2.4&&b[1][1]-b[0][1]<2.4){const q=pt.proj(p.c);if(q){dots+='<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="2.6"/>';grow(q[0]-3,q[1]-3,q[0]+3,q[1]+3)}return}
   d+=(pa(ft)||"").replace(/(\.\d)\d+/g,"$1");grow(b[0][0],b[0][1],b[1][0],b[1][1])});if(pt.box)grow(pt.box[0],pt.box[1],pt.box[0]+pt.box[2],pt.box[1]+pt.box[3])});
 const frames=placed.map(o=>'<rect class="ol-inset" x="'+o.box[0].toFixed(1)+'" y="'+o.box[1].toFixed(1)+'" width="'+o.box[2].toFixed(1)+'" height="'+o.box[3].toFixed(1)+'" rx="8" fill="none" stroke="rgba(110,124,142,.55)" stroke-width="1.2" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/>').join("");
 const m=12,vb=[bb[0]-m,bb[1]-m,bb[2]-bb[0]+2*m,bb[3]-bb[1]+2*m].map(v=>+v.toFixed(1));
 return(CACHE[code]={vb,inner:frames+'<path fill-rule="evenodd" d="'+d+'"/>'+dots,parts})}
/* which part of the drawing a place belongs to (the part with the nearest piece of land) */
function partOf(L,ll){let best=L.parts[0],bd=1e9;L.parts.forEach(pt=>pt.ps.forEach(p=>{const d=Math.max(0,dist(p.c,ll)-p.rad);if(d<bd){bd=d;best=pt}}));return best}
window.gfOutline={layout,partOf};
function hook(){if(typeof countryOutlineSVG!=="function"){setTimeout(hook,500);return}if(countryOutlineSVG._gfIns)return;const o=countryOutlineSVG;
 countryOutlineSVG=function(code,extraClass,fillColor){let L=null;try{L=layout(code)}catch(e){console.error(e)}if(!L)return o.apply(this,arguments);
  const fill=fillColor?' style="fill:'+fillColor+'"':"";return'<svg class="country-outline '+(extraClass||"")+'" viewBox="'+L.vb.join(" ")+'" preserveAspectRatio="xMidYMid meet"'+fill+'>'+L.inner+'</svg>'};countryOutlineSVG._gfIns=1}
hook();setInterval(()=>{if(typeof countryOutlineSVG==="function"&&!countryOutlineSVG._gfIns)hook()},3000);
})();
