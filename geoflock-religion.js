/* GeoFlock: the Religion map (Maps, Culture, Religion) drawn like the classic religion maps:
   each country is coloured by its largest religion and filled with a repeating pattern of that
   religion's symbol, on the flat map (SVG patterns) and on the globe (symbols drawn on a geographic grid).
   Sources: Pew Research Center, "Religious Composition by Country, 2010-2020" (2025 dataset; the largest
   group and its share in 2020); Christian branch: Pew, "Global Christianity" (2011); Sunni or Shia:
   Pew, "Mapping the Global Muslim Population" (2009); places under 100,000 people (not in Pew's
   dataset): CIA World Factbook. */
(function(){
if(typeof TH_THEMES==="undefined"||!TH_THEMES.rel)return;
const T=TH_THEMES.rel;

/* ---------- data ---------- */
/* Pew 2020: largest group and its share of the population. C Christian, M Muslim, U no religion,
   B Buddhist, H Hindu, J Jewish, O other religions (folk and others) */
const PEW_RAW="ae:M73 af:M100 al:M75 am:C97 ao:C93 ar:C88 at:C68 au:C47 aw:C81 az:M95 ba:M54 bb:C77 bd:M91 be:C51 bf:M67 bg:C79 bh:M74 bi:C95 bj:C53 bn:M82 bo:C89 br:C81 bs:C98 bt:B75 bw:C82 by:C85 bz:C74 ca:C53 cd:C96 cf:C91 cg:C92 ch:C62 ci:M46 cl:C68 cm:C70 cn:U90 co:C86 cr:C88 cu:C61 cv:C78 cw:C91 cy:C68 cz:U73 de:C56 dj:M98 dk:C77 do:C78 dz:M98 ec:C89 ee:C53 eg:M95 eh:M100 er:M52 es:C69 et:C62 fi:C72 fj:C70 fm:C99 fr:C46 ga:C84 gb:C49 gd:C87 ge:C88 gf:C84 gg:C85 gh:C71 gm:M97 gn:M87 gp:C96 gq:C89 gr:C89 gt:C92 gu:C94 gw:M56 gy:C66 hk:U71 hn:C88 hr:C91 ht:C89 hu:C72 id:M87 ie:C81 il:J77 in:H79 iq:M99 ir:M100 is:C75 it:C80 je:C85 jm:C69 jo:M97 jp:U57 ke:C86 kg:M92 kh:B97 ki:C98 km:M98 kp:U73 kr:U48 kw:M80 kz:M78 la:B64 lb:M68 lc:C92 lk:B70 lr:C85 ls:C97 lt:C92 lu:C66 lv:C77 ly:M99 ma:M100 md:C100 me:C76 mg:C74 mk:C65 ml:M94 mm:B89 mn:B51 mo:U68 mq:C96 mr:M99 mt:C89 mu:H48 mv:M94 mw:C87 mx:C89 my:M64 mz:C61 na:C91 nc:C85 ne:M98 ng:M56 ni:C85 nl:U54 no:C71 np:H81 nz:U51 om:M82 pa:C91 pe:C94 pf:C93 pg:C99 ph:C91 pk:M97 pl:C91 pr:C89 ps:M99 pt:C85 py:C94 qa:M76 re:C88 ro:C99 rs:C92 ru:C70 rw:C97 sa:M93 sb:C95 sc:C94 sd:M99 se:C61 sg:B31 si:C65 sk:C74 sl:M80 sn:M98 so:M100 sr:C53 ss:C61 st:C84 sv:C87 sy:M94 sz:C93 td:M56 tg:C57 th:B94 tj:M99 tl:C100 tm:M94 tn:M99 to:C98 tr:M97 tt:C70 tw:O52 tz:C65 ua:C83 ug:C88 us:C64 uy:U52 uz:M96 vc:C86 ve:C88 vi:C94 vn:U68 vu:C84 ws:C98 xk:M94 ye:M100 yt:M99 za:C85 zm:C98 zw:C87";
const PEW={};PEW_RAW.split(" ").forEach(s=>{const[c,v]=s.split(":");PEW[c]=[v[0],+v.slice(1)]});
const GROUP={C:"Christian",M:"Muslim",U:"no religion",B:"Buddhist",H:"Hindu",J:"Jewish",O:"folk or other religions"};
/* where Pew 2020 differs from the older map: Estonia's largest group is Christian (its largest church
   is Orthodox, 2021 census), Eritrea's and Lebanon's are Muslim (Lebanon: Sunni 31.9%, Shia 31.2%,
   CIA World Factbook), and in Vietnam most people have no religion */
Object.assign(T.data,{ee:"orth",er:"sun",lb:"sun",vn:"none"});
const NOTE={lb:"Sunni and Shia almost equal (CIA)"};

/* ---------- categories: colours (related branches share a hue) and symbols ---------- */
const CATS=[
 ["cat","Catholic","#3d6db3","mitre"],
 ["prot","Protestant","#6b9fd6","cross"],
 ["orth","Orthodox","#283f86","orth"],
 ["chr","Christian, mixed churches","#8ea8c9","gcross"],
 ["sun","Sunni Muslim","#3e9a62","crescent"],
 ["shi","Shia Muslim","#1d6545","crescent"],
 ["ibd","Ibadi Muslim","#74b98d","crescent"],
 ["hin","Hindu","#df7a36","om"],
 ["bud","Buddhist","#cf9a1c","wheel"],
 ["jew","Jewish","#7b5fc0","star"],
 ["folk","Folk religion","#c0574f","yinyang"],
 ["none","No religion","#99948a","none"]];
const SYM_OF={};CATS.forEach(c=>SYM_OF[c[0]]=c[3]);
T.cats=CATS.map(c=>[c[0],c[1],c[2]]);
T.title="Largest religion";
T.note="Each country's largest religious group in 2020 and its symbol. Not always a majority. Sources: Pew Research Center, Religious Composition by Country 2010–2020; Christian branch from Pew, Global Christianity (2011); Sunni or Shia from Pew, Mapping the Global Muslim Population (2009); places under 100,000 people from the CIA World Factbook. Grey: no data.";

/* ---------- symbols, drawn in a 24 x 24 box: [path, "f" fill | "s" stroke, stroke width or "e" for an even-odd fill] ---------- */
function starD(cx,cy,R,r,n){let d="";for(let i=0;i<2*n;i++){const a=-Math.PI/2+i*Math.PI/n,q=i%2?r:R;d+=(i?"L":"M")+(cx+q*Math.cos(a)).toFixed(2)+" "+(cy+q*Math.sin(a)).toFixed(2)}return d+"Z"}
function circD(cx,cy,r){return`M${cx-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z`}
function wheel(){let spokes="",knobs="";for(let i=0;i<8;i++){const a=i*Math.PI/4,c=Math.cos(a),s=Math.sin(a);
 spokes+=`M${(12+2*c).toFixed(2)} ${(12+2*s).toFixed(2)}L${(12+7.6*c).toFixed(2)} ${(12+7.6*s).toFixed(2)}`;knobs+=circD(+(12+9.6*c).toFixed(2),+(12+9.6*s).toFixed(2),1.35)}
 return[[circD(12,12,7.4),"s",1.7],[spokes,"s",1.4],[circD(12,12,2.1)+knobs,"f"]]}
const SYMS={
 cross:[["M10.4 2.5h3.2v5.6h5.2v3.2h-5.2v10.2h-3.2V11.3H5.2V8.1h5.2z","f"]],
 gcross:[["M10.2 4h3.6v6.2H20v3.6h-6.2V20h-3.6v-6.2H4v-3.6h6.2z","f"]],
 mitre:[["M5.5 21.5V10.2C5.5 6.6 8.6 3.6 12 1.8c3.4 1.8 6.5 4.8 6.5 8.4v11.3zM11 7.5v3.3H8.2v2.1H11v6h2v-6h2.8v-2.1H13V7.5z","f","e"]],
 orth:[["M11 2h2v20h-2zM8.6 4.8h6.8v1.8H8.6zM6 8.6h12v2.2H6zM6.8 17.6l10.1-3.1.5 1.7-10.1 3.1z","f"]],
 crescent:[["M14.38 5.3A8 8 0 1 0 14.38 18.7A6.8 6.8 0 1 1 14.38 5.3Z"+starD(18.6,12,3.5,1.45,5),"f"]],
 star:[["M12 2.6L20.2 16.8H3.8ZM12 21.4L3.8 7.2H20.2Z","s",1.9]],
 om:[["M4.6 6.8C7.6 4 11.8 5.6 10.5 9.2 9.8 11 8.2 11.4 6.8 11.3 10.6 11 13 13.6 11.6 17 10.2 20.2 6 20 4.2 17.6","s",1.9],
  ["M10.6 13.6C12.6 11.2 16.8 11.2 17.6 14.4 18.3 17.4 16.4 20.4 13.4 20.8","s",1.9],
  ["M13.6 6.2C15.2 8.6 18.4 8.6 20.2 6.2","s",1.7],[circD(17,3.3,1.3),"f"]],
 wheel:wheel(),
 yinyang:[[circD(12,12,9.2),"s",1.5],["M12 2.8A9.2 9.2 0 0 1 12 21.2A4.6 4.6 0 0 1 12 12A4.6 4.6 0 0 0 12 2.8Z"+circD(12,7.4,1.5)+circD(12,16.6,1.5),"f","e"]],
 none:[[circD(12,12,7.6),"s",2],["M6.6 17.4L17.4 6.6","s",2]]};
function symSVG(name,col){return(SYMS[name]||[]).map(([d,m,w])=>m==="f"?`<path d="${d}" fill="${col}"${w==="e"?' fill-rule="evenodd"':""}/>`:`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}
const P2D={};function p2d(name){if(P2D[name])return P2D[name];return P2D[name]=(SYMS[name]||[]).map(([d,m,w])=>[new Path2D(d),m,w])}
const SYM_FILL="rgba(255,255,255,0.62)";

/* ---------- state ---------- */
function relOn(){try{return thOn()&&allMapsColorMode==="culture"&&allMapsSubMode.culture==="rel"}catch(e){return false}}
function catShown(code){const k=thCatOf(code,"rel");if(!k||k==="dep"||!SYM_OF[k])return null;if(thFocus&&thFocus!==k)return null;return k}
const TILE_PX=34;/* one pattern tile on screen, about; holds two symbols */
function level(unitsPerPx){return Math.pow(2,Math.round(Math.log2(TILE_PX*unitsPerPx)))}

/* ---------- flat map ---------- */
const NS="http://www.w3.org/2000/svg";
let flatTile=0;
function flatSvg(){const w=document.getElementById("allMapsWrap");return w&&w.querySelector("svg")}
function vbOf(svg){const v=(svg.getAttribute("viewBox")||"").split(/[\s,]+/).map(Number);return v.length===4&&v[2]>0?v:null}
function tileFor(svg){const v=vbOf(svg),r=svg.getBoundingClientRect();if(!v||!r.width)return 32;const upp=Math.max(v[2]/r.width,v[3]/r.height);return level(upp)}
function ensureDefs(svg){let d=svg.querySelector("#gfRelDefs");if(!d){d=document.createElementNS(NS,"defs");d.id="gfRelDefs";svg.insertBefore(d,svg.firstChild);
 d.innerHTML=Object.keys(SYMS).map(n=>`<symbol id="gfRelSym-${n}" viewBox="0 0 24 24" overflow="visible">${symSVG(n,SYM_FILL)}</symbol>`).join("")}return d}
const patIds={};
function patternFor(svg,k,fill,tile){const key=k+"|"+fill,defs=ensureDefs(svg);let id=patIds[key];if(!id){id=patIds[key]="gfRelPat-"+Object.keys(patIds).length}
 let p=defs.querySelector("#"+id);if(!p){p=document.createElementNS(NS,"pattern");p.id=id;p.setAttribute("patternUnits","userSpaceOnUse");defs.appendChild(p)}
 if(p.dataset.tile!==String(tile)){p.dataset.tile=tile;const s=tile*0.44,a=tile/4-s/2,b=3*tile/4-s/2;
  p.setAttribute("width",tile);p.setAttribute("height",tile);
  p.innerHTML=`<rect width="${tile}" height="${tile}" fill="${fill}"/><use href="#gfRelSym-${SYM_OF[k]}" x="${a}" y="${a}" width="${s}" height="${s}"/><use href="#gfRelSym-${SYM_OF[k]}" x="${b}" y="${b}" width="${s}" height="${s}"/>`}
 return id}
function clearFlat(svg){svg.querySelectorAll(".gf-rel-small").forEach(g=>g.remove());svg.querySelectorAll("path[data-gf-rel]").forEach(p=>{delete p.dataset.gfRel})}
function applyFlat(){const svg=flatSvg();if(!svg)return;
 if(!relOn()){if(svg.querySelector(".gf-rel-small,path[data-gf-rel]"))clearFlat(svg);flatTile=0;return}
 const tile=tileFor(svg);flatTile=tile;svg.querySelectorAll(".gf-rel-small").forEach(g=>g.remove());
 const smalls=new Map();
 svg.querySelectorAll("path[id]").forEach(p=>{const code=p.id.toLowerCase(),k=catShown(code);if(!k){delete p.dataset.gfRel;return}
  const fill=thColor(code);let bb=p._gfRelBB;if(!bb){try{bb=p.getBBox()}catch(e){bb=null}if(bb&&bb.width)p._gfRelBB=bb}
  p.dataset.gfRel=k;p.style.fill=`url(#${patternFor(svg,k,fill,tile)})`;
  /* too small to hold a tile's symbol: one symbol in the middle instead */
  if(bb&&Math.max(bb.width,bb.height)<tile*0.75){const s=Math.min(tile*0.44,Math.max(bb.width,bb.height)*0.85);
   const par=p.parentNode;if(!smalls.has(par))smalls.set(par,[]);smalls.get(par).push(`<use href="#gfRelSym-${SYM_OF[k]}" x="${(bb.x+bb.width/2-s/2).toFixed(2)}" y="${(bb.y+bb.height/2-s/2).toFixed(2)}" width="${s.toFixed(2)}" height="${s.toFixed(2)}"/>`)}});
 smalls.forEach((list,par)=>{const g=document.createElementNS(NS,"g");g.setAttribute("class","gf-rel-small");g.setAttribute("pointer-events","none");g.innerHTML=list.join("");par.appendChild(g)})}
/* zooming: keep the symbols about the same size on screen, re-tiling at each doubling */
let obsSvg=null,obs=null;
function watchZoom(){const svg=flatSvg();if(!svg||svg===obsSvg)return;obsSvg=svg;if(obs)obs.disconnect();
 obs=new MutationObserver(()=>{if(!relOn()||!flatTile)return;const t=tileFor(svg);if(t!==flatTile)requestAnimationFrame(()=>{if(relOn()&&tileFor(svg)!==flatTile)applyFlat()})});
 obs.observe(svg,{attributes:true,attributeFilter:["viewBox"]})}
{const _ap=applyAllMapsColorMode;applyAllMapsColorMode=function(){const r=_ap.apply(this,arguments);try{applyFlat();watchZoom()}catch(e){console.error(e)}return r}}
window.addEventListener("resize",()=>{if(relOn())setTimeout(applyFlat,200)});

/* ---------- globe ---------- */
function drawSym(ctx,name,x,y,size){const parts=p2d(name);ctx.save();ctx.translate(x-size/2,y-size/2);const k=size/24;ctx.scale(k,k);
 parts.forEach(([pp,m,w])=>{if(m==="f")ctx.fill(pp,w==="e"?"evenodd":"nonzero");else{ctx.lineWidth=w;ctx.stroke(pp)}});ctx.restore()}
/* a feature's box on screen, from a sample of its outline's points that face the viewer */
function samplePts(f){if(f._gfRelS)return f._gfRelS;const all=[];const walk=c=>{if(typeof c[0]==="number")all.push(c);else c.forEach(walk)};walk(f.geometry.coordinates);
 const st=Math.max(1,Math.floor(all.length/300));const out=[];for(let i=0;i<all.length;i+=st)out.push(all[i]);return f._gfRelS=out}
function scrBounds(f,p,inView){let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;samplePts(f).forEach(ll=>{if(!inView(ll[0],ll[1]))return;const q=p(ll);if(!q)return;
 if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1]});return x0<=x1?[[x0,y0],[x1,y1]]:null}
function globeDraw(ctx,p,gv){if(!relOn())return;const path=d3.geoPath(p,ctx);const flat=!!(gv&&gv._flat);
 const cv=ctx.canvas,W=cv.clientWidth||(gv&&gv.host&&gv.host.clientWidth)||p.translate()[0]*2,H=cv.clientHeight||(gv&&gv.host&&gv.host.clientHeight)||p.translate()[1]*2;
 const rot=p.rotate(),ctr=flat?[0,0]:[-rot[0],-rot[1]];
 /* screen pixels per degree where the view is: measured, so it suits the globe and the flat (Robinson) map alike */
 let ref=ctr;if(flat){const m=p.invert&&p.invert([W/2,H/2]);if(m&&isFinite(m[0])&&isFinite(m[1]))ref=[Math.max(-170,Math.min(170,m[0])),Math.max(-60,Math.min(60,m[1]))]}
 const qa=p([ref[0]-0.5,ref[1]]),qb=p([ref[0]+0.5,ref[1]]);if(!qa||!qb)return;const pxPerDeg=Math.hypot(qb[0]-qa[0],qb[1]-qa[1]);if(!(pxPerDeg>0))return;
 const dlat=level(1/pxPerDeg),pxTile=dlat*pxPerDeg,size=pxTile*0.44;if(size<4)return;
 const S=p.scale(),half=Math.hypot(W,H)/2/S,vis=flat?Math.PI:half>=1?Math.PI/2:Math.asin(half),visDeg=flat?180:vis*180/Math.PI;
 const inView=flat?()=>true:(lon,lat)=>d3.geoDistance([lon,lat],ctr)<Math.min(vis,Math.PI/2-0.02);
 let latTop=90,latBot=-90;if(flat&&p.invert){const t=p.invert([W/2,0]),u=p.invert([W/2,H]);if(t&&isFinite(t[1]))latTop=Math.min(90,t[1]+dlat);if(u&&isFinite(u[1]))latBot=Math.max(-90,u[1]-dlat)}
 const feats=(gv&&gv.features)||[];ctx.save();ctx.fillStyle=SYM_FILL;ctx.strokeStyle=SYM_FILL;ctx.lineCap="round";ctx.lineJoin="round";
 feats.forEach(f=>{const code=f.properties&&f.properties.c;if(!code||!f.geometry)return;const k=catShown(code);if(!k)return;const sym=SYM_OF[k];
  const b=f._gfRelB||(f._gfRelB=d3.geoBounds(f));
  let la0=Math.max(b[0][1],ctr[1]-visDeg,latBot),la1=Math.min(b[1][1],ctr[1]+visDeg,latTop);if(la0>la1)return;
  const sb=scrBounds(f,p,inView);if(!sb)return;if(!isFinite(sb[0][0])||sb[1][0]<0||sb[1][1]<0||sb[0][0]>W||sb[0][1]>H)return;
  const sw=sb[1][0]-sb[0][0],sh=sb[1][1]-sb[0][1];if(sw<1||sh<1)return;
  const small=Math.max(sw,sh)<pxTile*1.6;const pts=[];
  const i0=Math.ceil(la0/(dlat/2)),i1=Math.floor(la1/(dlat/2));
  for(let i=i0;i<=i1;i++){const lat=i*dlat/2;const cl=Math.cos(lat*Math.PI/180);if(cl<0.02)continue;const dlon=dlat/cl;const off=(i&1)?dlon/2:0;
   let lo0=b[0][0],lo1=b[1][0];if(lo1<lo0)lo1+=360;
   if(flat){if(p.invert){const y=(p([0,lat])||[0,H/2])[1],l=p.invert([0,y]),r=p.invert([W,y]);
     if(l&&r&&isFinite(l[0])&&isFinite(r[0])&&r[0]>l[0]){const L0=l[0]-dlon,L1=r[0]+dlon;
      /* the feature's longitudes may run past 180 (lo1 up to 540): test both copies */
      const a0=Math.max(lo0,L0),a1=Math.min(lo1,L1),b0=Math.max(lo0,L0+360),b1=Math.min(lo1,L1+360);
      if(a0<=a1){lo0=a0;lo1=a1}else if(b0<=b1){lo0=b0;lo1=b1}else continue}}}
   else if(Math.abs(lat)+visDeg<88){const sp=Math.min(180,Math.asin(Math.min(1,Math.sin(vis)/cl))*180/Math.PI+dlon);
    let c0=ctr[0];while(c0<lo0-180)c0+=360;while(c0>lo0+180)c0-=360;lo0=Math.max(lo0,c0-sp);lo1=Math.min(lo1,c0+sp);if(lo0>lo1)continue}
   const j0=Math.ceil((lo0-off)/dlon),j1=Math.floor((lo1-off)/dlon);if(j1-j0>4000)continue;
   for(let j=j0;j<=j1;j++){let lon=j*dlon+off;if(lon>180)lon-=360;if(!inView(lon,lat))continue;
    if(small&&!d3.geoContains(f,[lon,lat]))continue;const q=p([lon,lat]);if(!q||q[0]<-size||q[1]<-size||q[0]>W+size||q[1]>H+size)continue;pts.push(q)}}
  if(small){if(pts.length)pts.forEach(q=>drawSym(ctx,sym,q[0],q[1],size));
   else{let ll=null;try{ll=typeof globeLabelPoint==="function"?globeLabelPoint(f):d3.geoCentroid(f)}catch(e){ll=d3.geoCentroid(f)}
    if(!ll||!inView(ll[0],ll[1]))return;const q=p(ll);const s=Math.min(size,Math.max(sw,sh)*0.85);if(q&&s>=5)drawSym(ctx,sym,q[0],q[1],s)}return}
  if(!pts.length)return;ctx.save();ctx.beginPath();path(f);ctx.clip();pts.forEach(q=>drawSym(ctx,sym,q[0],q[1],size));ctx.restore()});
 ctx.restore()}
function patchGlobe(){try{if(typeof amGlobe!=="undefined"&&amGlobe&&!amGlobe._relPatched){const d0=amGlobe.cfg.drawExtra;
  amGlobe.cfg.drawExtra=(ctx,p,gv)=>{if(d0)d0(ctx,p,gv);try{globeDraw(ctx,p,gv)}catch(e){console.error(e)}};amGlobe._relPatched=true;amGlobe.request()}}catch(e){}}
{const _gs=amGlobeSync;amGlobeSync=function(){const r=_gs.apply(this,arguments);patchGlobe();return r}}

/* ---------- legend: symbol on the colour, and the sources ---------- */
{const _lh=thLegendHTML;thLegendHTML=function(){let h=_lh.apply(this,arguments);if(!h||!relOn())return h;
 CATS.forEach(([k,,col,sym])=>{h=h.replace(new RegExp(`(data-th="${k}"[^>]*>)<i style="background:${col}"></i>`),`$1<i class="gf-rel-sw" style="background:${col}"><svg viewBox="0 0 24 24" aria-hidden="true">${symSVG(sym,"rgba(255,255,255,0.92)")}</svg></i>`)});
 return h}}
const css=document.createElement("style");css.textContent=`.legend-swatch i.gf-rel-sw{width:22px;height:22px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;flex:none}.legend-swatch i.gf-rel-sw svg{width:82%;height:82%;display:block}`;
document.head.appendChild(css);

/* ---------- hover: name, largest religion and its share ---------- */
{const _hv=allMapsHoverValue;allMapsHoverValue=function(code){const v=_hv.apply(this,arguments);if(!relOn()||!v||!code)return v;
 const info=TERRITORY_INFO[code],dc=info&&info.countsAs||code;const k=thCatOf(code,"rel"),row=k&&thCatRow(T,k);if(!row)return v;
 const pw=PEW[dc];let txt=row[1];
 if(pw){const n=pw[1]>=100?"over 99%":pw[1]+"%";txt+=pw[0]==="U"?` · ${n} have no religion`:` · ${n} ${GROUP[pw[0]]}`;txt+=" (Pew 2020)"}else txt+=" (CIA World Factbook)";
 if(NOTE[dc])txt+="; "+NOTE[dc];return[txt,v[1]]}}

/* the guided tour's line about the least religious places, kept in step with Pew 2020 */
try{const seen=new WeakSet;const fix=o=>{if(!o||typeof o!=="object"||seen.has(o))return;seen.add(o);if(Array.isArray(o)){o.forEach(fix);return}
 if(typeof o.stat==="string"&&o.stat.indexOf("Czechia and Estonia")>=0)o.stat=o.stat.replace("Czechia and Estonia","Czechia and Vietnam");
 Object.keys(o).forEach(key=>{const x=o[key];if(x&&typeof x==="object"&&!(x instanceof Node))fix(x)})};
 if(typeof PS_TOURS!=="undefined")fix(PS_TOURS)}catch(e){}

try{const w=document.getElementById("allMapsWrap");if(w&&relOn())applyAllMapsColorMode(w)}catch(e){}
})();
