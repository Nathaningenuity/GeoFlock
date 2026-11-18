/* GeoFlock: the Religion map (Maps, Culture, Religion) drawn like the classic religion maps, but showing the mix:
   each country is coloured by its largest religion and filled with a repeating pattern of that religion's symbol, on
   the flat map (SVG patterns) and on the globe (symbols drawn on a geographic grid). Where the largest group is 75% of the
   people or less, the country is striped instead: diagonal stripes for every group of 10% or more, each stripe as wide as the
   group's share and carrying that group's colour and symbol. 75% because then at least one person in four belongs to
   another group, which a single colour hides; 10% so that small minorities do not turn the map into confetti (they are
   still listed when hovering). Where a well-sourced figure exists for the regions of a country (state, province,
   canton...), the regions are drawn on their own, with the same rules, over the country.
   Sources: Pew Research Center, "Religious Composition by Country, 2010-2020" (2025), the full composition for 2020
   (Christian, Muslim, unaffiliated, Buddhist, Hindu, Jewish, other) as published in Pew's table "Religious Composition
   by Country, 2010-2070" (pewresearch.org, whose 2020 figures are the same estimates), rounded to whole percent;
   Christian branch: Pew, "Global Christianity" (2011); Sunni or Shia: Pew, "Mapping the Global Muslim Population"
   (2009); places under 100,000 people (not in Pew's dataset): CIA World Factbook.
   Regions (textures/RELIGION_REGIONS.json: outlines from Natural Earth admin-1, public domain, as in provinces/,
   simplified; one source per country, a few regions name their own):
     India: Census of India 2011, by state (Ladakh, Telangana and the merged Dadra-Daman split out as in the census
     district figures). Sri Lanka: Census of Population and Housing 2012, by province. Ethiopia: 2007 census, by region.
     Kazakhstan: 2021 census, by region. Germany: Politbarometer 2016 (Forschungsgruppe Wahlen), by state (Berlin,
     reported as East and West, keeps the national pattern). Russia: Arena atlas survey 2012 (Sreda), by republic;
     Chechnya and Ingushetia, which Arena did not survey: Caucasus Times poll 2010. Bosnia and Herzegovina: 2013 census
     (Agency for Statistics, final results, tables 4.1-4.2), by canton and entity. Nigeria: Afrobarometer rounds 9
     (2022) and 10 (2024) together, weighted, by geopolitical zone (Nigeria's census has not asked about religion since
     1963). Ghana, Togo: Afrobarometer rounds 9 and 10, by region (Ghana's 16 regions merged back into the 10 drawn).
     Tanzania: Zanzibar about 99% Muslim, US State Department International Religious Freedom Report. Malaysia: 2020
     census, by state. Indonesia: Ministry of Religious Affairs, population by religion (2022, North Sumatra 2023),
     Bali from the population register (2024); only the provinces with a large non-Muslim share. Philippines: 2020
     census (Philippine Statistics Authority), Muslims by region, where 10% or more. China (no census question on
     religion): Ningxia from Yang Zongde's 2010 study of China's Muslim population (in Min Junqing, JISMOR 8, 2010),
     Tibet from the US State Department's 2012 estimates. Where a source gives only some groups (Philippines, Ningxia),
     the rest is drawn in the country's main colour and called "not broken down". */
(function(){
if(typeof TH_THEMES==="undefined"||!TH_THEMES.rel)return;
const T=TH_THEMES.rel;

/* ---------- data ---------- */
/* Pew 2020, the whole composition: each group of 0.5% or more, largest first, in whole percent. C Christian, M Muslim,
   U no religion (unaffiliated), B Buddhist, H Hindu, J Jewish, O other religions (folk and others) */
const COMP_RAW="ae:M73C14H12 af:M100 al:M75C18U8 am:C97O1U1 ao:C93U6O1 ar:C88U9O1M1 at:C68U22M8O1 au:C47U42M4H3B3O1 aw:C81O11U6B1 az:M95U5 ba:M54C45U1O1 bb:C77U20O1M1 bd:M91H8B1 be:C51U39M7O3 bf:M67C28O4U1 bg:C79M10U10 bh:M74C14H11O1 bi:C95M3U1O1 bj:C53M31O10U5 bn:M82C7B6O3H1 bo:C89U10O1 br:C81U13O6 bs:C98U2 bt:B75H23O2C1 bw:C82U15O2 by:C85U14O1 bz:C74U16O9 ca:C53U35M5O3B2H2J1 cd:C96O1M1U1 cf:C91M6O3 cg:C92U5M1O1 ch:C62U31M6B1H1 ci:M46C45U6O3 cl:C68U30O1 cm:C70M25O3U2 cn:U90B4O3M2C2 co:C86U10O4 cr:C88U10O2 cu:C61U22O17 cv:C78U21O1 cw:C91U6H2 cy:C68M24U7B1 cz:U73C26 de:C56U36M7 dj:M98U1C1 dk:C77U17M4O1B1 do:C78U20O3 dz:M98U1 ec:C89U8O3 ee:C53U44O3M1 eg:M95C5 eh:M100 er:M52C47U1O1 es:C69U26M4 et:C62M36O2 fi:C72U25M2O1 fj:C70H24M6 fm:C99U1 fr:C46U43M9B1J1 ga:C84M9U6O2 gb:C49U40M6H2O1 gd:C87O6U6 ge:C88M10U1 gf:C84O9U3H2M1B1 gg:C85U14 gh:C71M20O8U1 gm:M97C3 gn:M87C12U1 gp:C96U2 gq:C89U5M4O2 gr:C89M5U5O1 gt:C92U6O2 gu:C94O3U2B1 gw:M56C22U12O11 gy:C66H23M7U3O1 hk:U71C19B8O1 hn:C88U10O2 hr:C91U7M1O1 ht:C89U9O2 hu:C72U27 id:M87C10H2B1 ie:C81U16M2H1O1 il:J77M15U4C2O2 in:H79M15O3C2B1 iq:M99 ir:M100 is:C75U20O2B1M1 it:C80U13M4O1B1 je:C85U14 jm:C69U24O8 jo:M97C3 jp:U57B37O3C2 ke:C86M11O2U2 kg:M92C6O1U1 kh:B97M2 ki:C98O2 km:M98O1C1 kp:U73O25B2 kr:U48C32B19 kw:M80C11H9 kz:M78C19U3 la:B64O34C2 lb:M68C28O4 lc:C92U6O2 lk:B70H15M10C6 lr:C85M13U1O1 ls:C97U2O1 lt:C92U7O1 lu:C66U25O6M2 lv:C77U17O5M1 ly:M99C1 ma:M100 md:C100 me:C76M21O2U1 mg:C74U22O2M1 mk:C65M35U1 ml:M94C3U3O1 mm:B89C6M3O1 mn:B51U41M4O3C1 mo:U68B20C10O2 mq:C96U3O1 mr:M99 mt:C89U5M4H1B1 mu:H48C33M18U1 mv:M94H3C2B1 mw:C87M12U1 mx:C89U11 my:M64B19C9H6O1U1 mz:C61M19U14O5 na:C91U6O4 nc:C85U11M3O1B1 ne:M98U1C1 ng:M56C43 ni:C85U13O2 nl:U54C35M6O4H1 no:C71U22M4O1B1 np:H81B8M5O4C2 nz:U51C40O3H3M1B1 om:M82H10C8 pa:C91U6O2 pe:C94U5 pf:C93U5O1 pg:C99O1 ph:C91M6O2 pk:M97H2C1 pl:C91U9 pr:C89U10 ps:M99C1 pt:C85U14 py:C94U4O2 qa:M76C13H11 re:C88H5M4U2O1 ro:C99U1 rs:C92M4U4 ru:C70U20M8O1 rw:C97M2U1 sa:M93C4H3 sb:C95O4 sc:C94U2H1M1B1O1 sd:M99U1 se:C61U29M8B1O1 sg:B31U20C19M16O9H5 si:C65U32M2O1 sk:C74U25O1 sl:M80C20 sn:M98C2 so:M100 sr:C53H22M13U8O3 ss:C61O33M6 st:C84U10O6 sv:C87U12O1 sy:M94C4U2 sz:C93U6 td:M56C39U3O2 tg:C57O19M16U8 th:B94M5C1 tj:M99C1 tl:C100 tm:M94C6 tn:M99 to:C98O1U1 tr:M97U3 tt:C70H21M5U2O1 tw:O52U23B19C6 tz:C65M30U3O2 ua:C83U15M1 ug:C88M11O1 us:C64U30J2B1M1O1H1 uy:U52C44O3 uz:M96C3O1U1 vc:C86U8O6 ve:C88U10O2 vi:C94U4O1 vn:U68B23C8O1 vu:C84O15U1 ws:C98O2 xk:M94C6 ye:M100 yt:M99C1 za:C85O9U3M2H1 zm:C98O1M1 zw:C87U11O2M1";
const COMP={},PEW={};COMP_RAW.split(" ").forEach(s=>{const[c,v]=s.split(":");const g=[];v.replace(/([A-Z])(\d+)/g,(_,k,n)=>{g.push([k,+n])});COMP[c]=g;PEW[c]=g[0]});
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
 ["sikh","Sikh","#a8467e","khanda"],
 ["jew","Jewish","#7b5fc0","star"],
 ["folk","Folk religion","#c0574f","yinyang"],
 ["none","No religion","#99948a","none"]];
const SYM_OF={},COL_OF={};CATS.forEach(c=>{SYM_OF[c[0]]=c[3];COL_OF[c[0]]=c[2]});
T.cats=CATS.map(c=>[c[0],c[1],c[2]]);
T.title="Religion";
T.note="Each country's largest religious group in 2020 and its symbol. Sources: Pew Research Center, Religious Composition by Country 2010–2020; Christian branch from Pew, Global Christianity (2011); Sunni or Shia from Pew, Mapping the Global Muslim Population (2009); places under 100,000 people from the CIA World Factbook. Regions: censuses of India 2011, Sri Lanka 2012, Ethiopia 2007, Kazakhstan 2021, Bosnia and Herzegovina 2013, Malaysia 2020 and the Philippines 2020; Indonesia's Ministry of Religious Affairs 2022; Afrobarometer 2022–24 (Nigeria, Ghana, Togo); Politbarometer 2016 (Germany); Arena 2012 and Caucasus Times 2010 (Russia); US State Department (Zanzibar, Tibet); Yang Zongde 2010 (Ningxia). Grey: no data.";
const MIX_LINE="Striped: no group is over 75%, so every group of 10% or more gets a stripe as wide as its share. Outlined regions have figures of their own; hover for the numbers.";
/* labels for the region figures, which name the group itself */
const LABEL={cat:"Catholic",prot:"Protestant",orth:"Orthodox",chr:"Christian",sun:"Muslim",shi:"Shia Muslim",ibd:"Ibadi Muslim",hin:"Hindu",bud:"Buddhist",sikh:"Sikh",jew:"Jewish",folk:"folk or other religions",none:"no religion",jain:"Jain",oth:"other religions",ns:"not stated"};

/* ---------- the mix: which groups get a stripe ---------- */
const MIX_MAX=75,BAND_MIN=10;
const BRANCH={C:["cat","prot","orth","chr"],M:["sun","shi","ibd"]},LETTER={U:"none",B:"bud",H:"hin",J:"jew",O:"folk"};
function catOfLetter(l,code){if(BRANCH[l]){const k=thCatOf(code,"rel");return BRANCH[l].includes(k)?k:BRANCH[l][l==="C"?3:0]}return LETTER[l]}
/* shares: [[category, percent]]; main: the category the map already gives the place (kept first). Returns the stripes
   [[category, fraction]] or null when the place is drawn in one colour */
function bandsOf(shares,main){const d=shares.filter(s=>SYM_OF[s[0]]&&s[1]>=BAND_MIN).sort((a,b)=>b[1]-a[1]);
 if(d.length<2||d[0][1]>MIX_MAX)return null;const i=d.findIndex(s=>s[0]===main);if(i>0)d.unshift(d.splice(i,1)[0]);
 const tot=d.reduce((a,s)=>a+s[1],0);return d.map(s=>[s[0],s[1]/tot])}
const unitCache={};
function countryBands(code){if(code in unitCache)return unitCache[code];const info=TERRITORY_INFO[code],dc=info&&info.countsAs||code,g=COMP[dc];
 const main=thCatOf(code,"rel");return unitCache[code]=g&&main?bandsOf(g.map(([l,n])=>[catOfLetter(l,dc),n]),main):null}

/* ---------- regions (loaded once the Religion map opens) ---------- */
let REG=null,regLoading=false;/* REG[code] = [{n, sh:[[cat,pct,rest?]], main, bands, src, f, b}] */
function loadRegions(){if(REG||regLoading)return;regLoading=true;
 fetch("textures/RELIGION_REGIONS.json?v=1").then(r=>r.json()).then(j=>{const out={};
  Object.keys(j).forEach(cc=>{const C=j[cc],natMain=thCatOf(cc,"rel");const list=out[cc]=C.r.map(([n,cs,g,s])=>{
   const sh=cs.split(",").map(x=>{const[k,v]=x.split(":");return[k,+v]});const known=sh.reduce((a,x)=>a+x[1],0);
   /* a source that names only some groups: the rest in the country's own colour */
   if(100-known>=BAND_MIN&&natMain&&SYM_OF[natMain])sh.push([natMain,Math.round(100-known),1]);
   const dr=sh.filter(x=>SYM_OF[x[0]]).sort((a,b)=>b[1]-a[1]),main=dr.length?dr[0][0]:null;
   const f={type:"Feature",properties:{n:n},geometry:g};return{n:n,sh:sh,main:main,bands:main?bandsOf(dr,main):null,src:s||C.s,f:f,b:d3.geoBounds(f)}});list.full=!!C.full});
  REG=out;try{const w=document.getElementById("allMapsWrap");if(w&&relOn())applyFlat()}catch(e){console.error(e)}
  try{if(typeof amGlobe!=="undefined"&&amGlobe)amGlobe.request()}catch(e){}}).catch(e=>{regLoading=false;console.error(e)})}
function regionsOf(code){return REG&&REG[code]||null}
function regionAt(code,ll){const R=regionsOf(code);if(!R||!ll)return null;
 for(const r of R){const b=r.b;if(ll[1]<b[0][1]-.05||ll[1]>b[1][1]+.05)continue;if(b[0][0]<=b[1][0]&&(ll[0]<b[0][0]-.05||ll[0]>b[1][0]+.05))continue;if(d3.geoContains(r.f,ll))return r}return null}

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
 none:[[circD(12,12,7.6),"s",2],["M6.6 17.4L17.4 6.6","s",2]],
 /* Sikh: a simple khanda, the double-edged sword inside a ring */
 khanda:[[circD(12,13.2,6.4),"s",1.7],["M11 1.8h2l.7 3.4v13.6L12 22l-1.7-3.2V5.2z","f"]]};
function symSVG(name,col){return(SYMS[name]||[]).map(([d,m,w])=>m==="f"?`<path d="${d}" fill="${col}"${w==="e"?' fill-rule="evenodd"':""}/>`:`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}
const P2D={};function p2d(name){if(P2D[name])return P2D[name];return P2D[name]=(SYMS[name]||[]).map(([d,m,w])=>[new Path2D(d),m,w])}
const SYM_FILL="rgba(255,255,255,0.62)";
const GREY="#ebe8e1";/* the theme's colour for a place hidden by a filter */

/* ---------- state ---------- */
function relOn(){try{return thOn()&&allMapsColorMode==="culture"&&allMapsSubMode.culture==="rel"}catch(e){return false}}
function focusHas(k){return!thFocus||thFocus==="_"||String(thFocus).split("+").includes(k)}/* several picked: "sun+shi+hin" */
function catShown(code){const k=thCatOf(code,"rel");if(!k||k==="dep"||!SYM_OF[k])return null;return focusHas(k)?k:null}
const TILE_PX=34;/* one pattern tile on screen, about; holds two symbols */
function level(unitsPerPx){return Math.pow(2,Math.round(Math.log2(TILE_PX*unitsPerPx)))}
/* stripes repeat every 1 to 3 tiles: wide on a big place, narrow on a small one so that every group still shows */
function stripeMult(sizeInTiles){return sizeInTiles>=8?3:sizeInTiles>=3?2:1}
/* along each stripe a symbol every 0.72 tile, about the spacing of the plain pattern */
function symsPerPeriod(L,tile){return Math.max(1,Math.round(L*Math.SQRT2/(0.72*tile)))}

/* ---------- flat map ---------- */
const NS="http://www.w3.org/2000/svg";
let flatTile=0;
function flatSvg(){const w=document.getElementById("allMapsWrap");return w&&w.querySelector("svg")}
function vbOf(svg){const v=(svg.getAttribute("viewBox")||"").split(/[\s,]+/).map(Number);return v.length===4&&v[2]>0?v:null}
function tileFor(svg){const v=vbOf(svg),r=svg.getBoundingClientRect();if(!v||!r.width)return 32;const upp=Math.max(v[2]/r.width,v[3]/r.height);return level(upp)}
function ensureDefs(svg){let d=svg.querySelector("#gfRelDefs");if(!d){d=document.createElementNS(NS,"defs");d.id="gfRelDefs";svg.insertBefore(d,svg.firstChild);
 d.innerHTML=Object.keys(SYMS).map(n=>`<symbol id="gfRelSym-${n}" viewBox="0 0 24 24" overflow="visible">${symSVG(n,SYM_FILL)}</symbol>`).join("")}return d}
const patIds={};
function patNode(svg,key){const defs=ensureDefs(svg);let id=patIds[key];if(!id){id=patIds[key]="gfRelPat-"+Object.keys(patIds).length}
 let p=defs.querySelector("#"+id);if(!p){p=document.createElementNS(NS,"pattern");p.id=id;p.setAttribute("patternUnits","userSpaceOnUse");defs.appendChild(p)}return p}
function patternFor(svg,k,fill,tile){const p=patNode(svg,k+"|"+fill);
 if(p.dataset.tile!==String(tile)){p.dataset.tile=tile;const s=tile*0.44,a=tile/4-s/2,b=3*tile/4-s/2;
  p.setAttribute("width",tile);p.setAttribute("height",tile);
  p.innerHTML=`<rect width="${tile}" height="${tile}" fill="${fill}"/><use href="#gfRelSym-${SYM_OF[k]}" x="${a}" y="${a}" width="${s}" height="${s}"/><use href="#gfRelSym-${SYM_OF[k]}" x="${b}" y="${b}" width="${s}" height="${s}"/>`}
 return p.id}
/* the stripes: a square tile of side L holding diagonal bands (x + y = const), symbols along each band's middle line.
   Shares are rounded to 5% so that similar places share one pattern. */
function stripeKey(bands){return bands.map(b=>b[0]+Math.round(b[1]*20)).join("_")}
function stripePattern(svg,bands,tile,mult){const p=patNode(svg,"s|"+stripeKey(bands)+"|"+mult),want=tile+"|"+mult;
 if(p.dataset.tile!==want){p.dataset.tile=want;const L=tile*mult,n=symsPerPeriod(L,tile),r=v=>+v.toFixed(2);
  const q=bands.map(b=>[b[0],Math.round(b[1]*20)/20]),tot=q.reduce((a,b)=>a+b[1],0);
  let fills=`<rect width="${r(L)}" height="${r(L)}" fill="${COL_OF[q[0][0]]}"/>`,uses="",a=0;
  q.forEach(([k,f])=>{const w=f/tot*L;
   if(a>0)[a,a+L].forEach(o=>{fills+=`<path d="M${r(o)} 0h${r(w+.4)}l${r(-L)} ${r(L)}h${r(-w-.4)}z" fill="${COL_OF[k]}"/>`});
   const s=Math.min(tile*0.44,w/Math.SQRT2*0.8);
   if(s>=tile*0.2){const c=a+w/2;for(let i=0;i<n;i++){const y=(i+.5)*L/n,x=((c-y)%L+L)%L;
    const xs=[x],ys=[y];if(x<s/2)xs.push(x+L);if(x>L-s/2)xs.push(x-L);if(y<s/2)ys.push(y+L);if(y>L-s/2)ys.push(y-L);
    xs.forEach(X=>ys.forEach(Y=>{uses+=`<use href="#gfRelSym-${SYM_OF[k]}" x="${r(X-s/2)}" y="${r(Y-s/2)}" width="${r(s)}" height="${r(s)}"/>`}))}}
   a+=w});
  p.setAttribute("width",r(L));p.setAttribute("height",r(L));p.innerHTML=fills+uses}
 return p.id}
function fillFor(svg,k,bands,fill,tile,size){return bands?`url(#${stripePattern(svg,bands,tile,stripeMult(size/tile))})`:`url(#${patternFor(svg,k,fill,tile)})`}
function bbOf(el){let bb=el._gfRelBB;if(!bb){try{bb=el.getBBox()}catch(e){bb=null}if(bb&&bb.width)el._gfRelBB=bb}return bb}
function clearFlat(svg){svg.querySelectorAll(".gf-rel-small,.gf-rel-reg").forEach(g=>g.remove());svg.querySelectorAll("path[data-gf-rel]").forEach(p=>{delete p.dataset.gfRel})}
/* a country's regions: drawn just above the country, clipped to its outline, never catching the pointer */
const robPath=()=>d3.geoPath(GLOBE_ROBINSON);
function regionLayer(svg,p,code,R,tile,countryShown){let g=p._gfRelReg;
 if(!g||!g.isConnected||g.parentNode!==p.parentNode){if(g)g.remove();const defs=ensureDefs(svg),cid="gfRelClip-"+code;
  if(!defs.querySelector("#"+cid)){const c=document.createElementNS(NS,"clipPath");c.id=cid;c.innerHTML=`<path/>`;defs.appendChild(c)}
  g=document.createElementNS(NS,"g");g.setAttribute("class","gf-rel-reg");g.setAttribute("pointer-events","none");g.setAttribute("clip-path",`url(#${cid})`);
  const gp=robPath();g.innerHTML=R.map(r=>`<path d="${gp(r.f.geometry)||""}" stroke="rgba(255,255,255,0.75)" stroke-width="0.7" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`).join("");
  let ref=p.nextSibling;while(ref&&ref.classList&&ref.classList.contains("tiny-hit-overlay"))ref=ref.nextSibling;p.parentNode.insertBefore(g,ref);p._gfRelReg=g}
 /* the clip is a copy of the country's outline (an id can be shared by other maps on the page, so no <use>); kept in step with it */
 {const cp=ensureDefs(svg).querySelector("#gfRelClip-"+code+" path"),d=p.getAttribute("d")||"";if(cp&&cp.getAttribute("d")!==d)cp.setAttribute("d",d);if(cp)cp.setAttribute("transform",p.getAttribute("transform")||"")}
 [...g.children].forEach((el,i)=>{const r=R[i];if(!r)return;const k=r.main&&focusHas(r.main)?r.main:null;
  if(!k){el.style.fill=countryShown?GREY:"none";return}const bb=bbOf(el);el.style.fill=fillFor(svg,k,r.bands,COL_OF[k],tile,bb?Math.max(bb.width,bb.height):tile*10)});
 g.style.display=""}
function applyFlat(){const svg=flatSvg();if(!svg)return;
 if(!relOn()){if(svg.querySelector(".gf-rel-small,.gf-rel-reg,path[data-gf-rel]"))clearFlat(svg);flatTile=0;return}
 loadRegions();
 const tile=tileFor(svg);flatTile=tile;svg.querySelectorAll(".gf-rel-small").forEach(g=>g.remove());
 const smalls=new Map(),seen=new Set();
 svg.querySelectorAll("path[id]").forEach(p=>{const code=p.id.toLowerCase(),k=catShown(code),R=regionsOf(code);
  if(R&&!seen.has(code)&&thCatOf(code,"rel")){seen.add(code);regionLayer(svg,p,code,R,tile,!!k)}else if(p._gfRelReg)p._gfRelReg.style.display="none";
  if(!k){delete p.dataset.gfRel;return}
  const fill=thColor(code),bb=bbOf(p),bands=countryBands(code);
  p.dataset.gfRel=k;p.style.fill=fillFor(svg,k,bands,fill,tile,bb?Math.max(bb.width,bb.height):tile*10);
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
/* the visible part of a feature: its latitude range and its box on screen, or null */
function visPart(E,f){const b=f._gfRelB||(f._gfRelB=d3.geoBounds(f));
 const la0=Math.max(b[0][1],E.ctr[1]-E.visDeg,E.latBot),la1=Math.min(b[1][1],E.ctr[1]+E.visDeg,E.latTop);if(la0>la1)return null;
 const sb=scrBounds(f,E.p,E.inView);if(!sb||!isFinite(sb[0][0])||sb[1][0]<0||sb[1][1]<0||sb[0][0]>E.W||sb[0][1]>E.H)return null;
 const sw=sb[1][0]-sb[0][0],sh=sb[1][1]-sb[0][1];if(sw<1||sh<1)return null;return{b:b,la0:la0,la1:la1,sw:sw,sh:sh}}
/* the longitudes of one latitude row worth visiting (the existing grid's rule), or null */
function lonRange(E,b,lat,pad){let lo0=b[0][0],lo1=b[1][0];if(lo1<lo0)lo1+=360;const cl=Math.cos(lat*Math.PI/180);if(cl<0.02)return null;
 if(E.flat){if(E.p.invert){const y=(E.p([0,lat])||[0,E.H/2])[1],l=E.p.invert([0,y]),r=E.p.invert([E.W,y]);
   if(l&&r&&isFinite(l[0])&&isFinite(r[0])&&r[0]>l[0]){const L0=l[0]-pad,L1=r[0]+pad;
    /* the feature's longitudes may run past 180 (lo1 up to 540): test both copies */
    const a0=Math.max(lo0,L0),a1=Math.min(lo1,L1),b0=Math.max(lo0,L0+360),b1=Math.min(lo1,L1+360);
    if(a0<=a1){lo0=a0;lo1=a1}else if(b0<=b1){lo0=b0;lo1=b1}else return null}}}
 else if(Math.abs(lat)+E.visDeg<88){const sp=Math.min(180,Math.asin(Math.min(1,Math.sin(E.vis)/cl))*180/Math.PI+pad);
  let c0=E.ctr[0];while(c0<lo0-180)c0+=360;while(c0>lo0+180)c0-=360;lo0=Math.max(lo0,c0-sp);lo1=Math.min(lo1,c0+sp);if(lo0>lo1)return null}
 return[lo0,lo1]}
/* one colour: the plain pattern of symbols on the geographic grid */
function drawPlain(E,f,v,sym,clips,fill){const{p,dlat,size,inView}=E,b=v.b;
 const small=Math.max(v.sw,v.sh)<E.pxTile*1.6;const pts=[];
 const i0=Math.ceil(v.la0/(dlat/2)),i1=Math.floor(v.la1/(dlat/2));
 for(let i=i0;i<=i1;i++){const lat=i*dlat/2;const cl=Math.cos(lat*Math.PI/180);if(cl<0.02)continue;const dlon=dlat/cl;const off=(i&1)?dlon/2:0;
  const lr=lonRange(E,b,lat,dlon);if(!lr)continue;
  const j0=Math.ceil((lr[0]-off)/dlon),j1=Math.floor((lr[1]-off)/dlon);if(j1-j0>4000)continue;
  for(let j=j0;j<=j1;j++){let lon=j*dlon+off;if(lon>180)lon-=360;if(!inView(lon,lat))continue;
   if(small&&!d3.geoContains(f,[lon,lat]))continue;const q=p([lon,lat]);if(!q||q[0]<-size||q[1]<-size||q[0]>E.W+size||q[1]>E.H+size)continue;pts.push(q)}}
 const ctx=E.ctx;
 /* too small for the grid to land inside: one symbol in the middle */
 const middle=()=>{let ll=null;try{ll=typeof globeLabelPoint==="function"?globeLabelPoint(f):d3.geoCentroid(f)}catch(e){ll=d3.geoCentroid(f)}
  if(!ll||!inView(ll[0],ll[1]))return;const q=p(ll);const s=Math.min(size,Math.max(v.sw,v.sh)*0.85);if(q&&s>=5)drawSym(ctx,sym,q[0],q[1],s)};
 if(small&&!fill){if(pts.length)pts.forEach(q=>drawSym(ctx,sym,q[0],q[1],size));else middle();return}
 if(!pts.length&&!fill)return;ctx.save();clips.forEach(c=>{ctx.beginPath();E.path(c);ctx.clip()});
 if(fill){ctx.fillStyle=fill;ctx.fillRect(0,0,E.W,E.H);ctx.fillStyle=SYM_FILL}
 if(small&&!pts.length)middle();else pts.forEach(q=>drawSym(ctx,sym,q[0],q[1],size));ctx.restore()}
/* clip a convex polygon [[X, lat]] to X0 <= X <= X1, la0 <= lat <= la1 */
function clipRect(P,X0,X1,la0,la1){const edge=(P,inside,cut)=>{const out=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],ia=inside(a),ib=inside(b);
  if(ia)out.push(a);if(ia!==ib)out.push(cut(a,b))}return out};
 const cx=(x)=>(a,b)=>{const t=(x-a[0])/(b[0]-a[0]);return[x,a[1]+t*(b[1]-a[1])]},cy=(y)=>(a,b)=>{const t=(y-a[1])/(b[1]-a[1]);return[a[0]+t*(b[0]-a[0]),y]};
 P=edge(P,q=>q[0]>=X0,cx(X0));if(P.length)P=edge(P,q=>q[0]<=X1,cx(X1));if(P.length)P=edge(P,q=>q[1]>=la0,cy(la0));if(P.length)P=edge(P,q=>q[1]<=la1,cy(la1));return P}
/* stripes: the same diagonal bands as the flat map, laid on the ground. Local plane: X = (lon - lon0)·cos(lat0),
   Y = -lat, in degrees; bands are x + y = const as on the flat map, one tile = dlat. */
function drawBands(E,f,v,bands,clips,anchor){const{p,dlat,size,inView,ctx}=E,b=v.b;
 const mult=stripeMult(Math.max(v.sw,v.sh)/E.pxTile),L=mult*dlat,n=symsPerPeriod(L,dlat);
 const k=Math.max(0.2,Math.cos(anchor[1]*Math.PI/180)),lon0=anchor[0];
 let lo0=b[0][0],lo1=b[1][0];if(lo1<lo0)lo1+=360;
 /* visible longitudes only, from the rows at the top, middle and bottom */
 if(!E.flat||p.invert){let m0=Infinity,m1=-Infinity;[v.la0,(v.la0+v.la1)/2,v.la1].forEach(lat=>{const lr=lonRange(E,b,lat,L/k);if(lr){m0=Math.min(m0,lr[0]);m1=Math.max(m1,lr[1])}});if(m0>m1)return;lo0=m0;lo1=m1}
 let r0=lo0-lon0;while(r0<-180)r0+=360;while(r0>180)r0-=360;const X0=r0*k,X1=(r0+lo1-lo0)*k,lonOf=X=>lon0+X/k;
 const uMin=X0-v.la1,uMax=X1-v.la0,j0=Math.floor(uMin/L)-1,j1=Math.ceil(uMax/L);if(j1-j0>400)return;
 const offs=[];let a=0;bands.forEach(([cat,fr])=>{offs.push([cat,a,fr*L]);a+=fr*L});
 ctx.save();clips.forEach(c=>{ctx.beginPath();E.path(c);ctx.clip()});
 ctx.fillStyle=COL_OF[bands[0][0]];ctx.fillRect(0,0,E.W,E.H);
 const step=Math.max(0.5,dlat/2);
 for(let j=j0;j<=j1;j++)offs.forEach(([cat,a0,w],bi)=>{if(!bi)return;const u1=j*L+a0,u2=u1+w+L*0.004;
  /* the band between lat = X - u2 and lat = X - u1, inside the box */
  let P=clipRect([[X0,X0-u2],[X1,X1-u2],[X1,X1-u1],[X0,X0-u1]],X0,X1,v.la0,v.la1);if(P.length<3)return;
  const ring=[];for(let i=0;i<P.length;i++){const A=P[i],B=P[(i+1)%P.length],d=Math.max(Math.abs(B[0]-A[0])/k,Math.abs(B[1]-A[1])),m=Math.max(1,Math.ceil(d/step));
   for(let t=0;t<m;t++){const X=A[0]+(B[0]-A[0])*t/m,la=A[1]+(B[1]-A[1])*t/m;ring.push([lonOf(X),la])}}
  ring.push(ring[0]);let ar=0;for(let i=0;i<ring.length-1;i++)ar+=ring[i][0]*ring[i+1][1]-ring[i+1][0]*ring[i][1];if(ar>0)ring.reverse();/* clockwise, as d3 wants */
  ctx.fillStyle=COL_OF[cat];ctx.beginPath();E.path({type:"Polygon",coordinates:[ring]});ctx.fill()});
 /* symbols along the middle of each band: lat = -(i + 0.5)·L/n, X = u - Y */
 ctx.fillStyle=SYM_FILL;
 const pxDeg=E.pxPerDeg,i0=Math.ceil(-v.la1*n/L-.5),i1=Math.floor(-v.la0*n/L-.5);
 if(i1-i0<=4000)offs.forEach(([cat,a0,w])=>{const s=Math.min(size,w/Math.SQRT2*pxDeg*0.8);if(s<size*0.45||s<4)return;const sym=SYM_OF[cat];
  for(let i=i0;i<=i1;i++){const Y=(i+.5)*L/n,lat=-Y;const c=a0+w/2;
   const m0=Math.ceil((X0+Y-c)/L),m1=Math.floor((X1+Y-c)/L);if(m1-m0>2000)continue;
   for(let m=m0;m<=m1;m++){let lon=lonOf(c+m*L-Y);if(lon>180)lon-=360;if(lon<-180)lon+=360;if(!inView(lon,lat))continue;
    const q=p([lon,lat]);if(!q||q[0]<-size||q[1]<-size||q[0]>E.W+size||q[1]>E.H+size)continue;drawSym(ctx,sym,q[0],q[1],s)}}});
 ctx.restore()}
function anchorOf(f){if(!f._gfRelA){const b=f._gfRelB||(f._gfRelB=d3.geoBounds(f));let c=(b[0][0]+b[1][0]+(b[1][0]<b[0][0]?360:0))/2;if(c>180)c-=360;f._gfRelA=[c,(b[0][1]+b[1][1])/2]}return f._gfRelA}
function globeDraw(ctx,p,gv){if(!relOn())return;loadRegions();const path=d3.geoPath(p,ctx);const flat=!!(gv&&gv._flat);
 const cv=ctx.canvas,W=cv.clientWidth||(gv&&gv.host&&gv.host.clientWidth)||p.translate()[0]*2,H=cv.clientHeight||(gv&&gv.host&&gv.host.clientHeight)||p.translate()[1]*2;
 const rot=p.rotate(),ctr=flat?[0,0]:[-rot[0],-rot[1]];
 /* screen pixels per degree where the view is: measured, so it suits the globe and the flat (Robinson) map alike */
 let ref=ctr;if(flat){const m=p.invert&&p.invert([W/2,H/2]);if(m&&isFinite(m[0])&&isFinite(m[1]))ref=[Math.max(-170,Math.min(170,m[0])),Math.max(-60,Math.min(60,m[1]))]}
 const qa=p([ref[0]-0.5,ref[1]]),qb=p([ref[0]+0.5,ref[1]]);if(!qa||!qb)return;const pxPerDeg=Math.hypot(qb[0]-qa[0],qb[1]-qa[1]);if(!(pxPerDeg>0))return;
 const dlat=level(1/pxPerDeg),pxTile=dlat*pxPerDeg,size=pxTile*0.44;if(size<4)return;
 const S=p.scale(),half=Math.hypot(W,H)/2/S,vis=flat?Math.PI:half>=1?Math.PI/2:Math.asin(half),visDeg=flat?180:vis*180/Math.PI;
 const inView=flat?()=>true:(lon,lat)=>d3.geoDistance([lon,lat],ctr)<Math.min(vis,Math.PI/2-0.02);
 let latTop=90,latBot=-90;if(flat&&p.invert){const t=p.invert([W/2,0]),u=p.invert([W/2,H]);if(t&&isFinite(t[1]))latTop=Math.min(90,t[1]+dlat);if(u&&isFinite(u[1]))latBot=Math.max(-90,u[1]-dlat)}
 const E={ctx,p,path,flat,W,H,ctr,pxPerDeg,dlat,pxTile,size,vis,visDeg,inView,latTop,latBot};
 const feats=(gv&&gv.features)||[];ctx.save();ctx.fillStyle=SYM_FILL;ctx.strokeStyle=SYM_FILL;ctx.lineCap="round";ctx.lineJoin="round";
 feats.forEach(f=>{const code=f.properties&&f.properties.c;if(!code||!f.geometry)return;const k=catShown(code),R=regionsOf(code);if(!k&&!R)return;
  const v=visPart(E,f);if(!v)return;
  /* a country whose regions cover it all needs no pattern of its own underneath */
  if(k&&!(R&&R.full)){const bands=countryBands(code);if(bands&&Math.max(v.sw,v.sh)>=4)drawBands(E,f,v,bands,[f],anchorOf(f));else drawPlain(E,f,v,SYM_OF[k],[f],null)}
  if(!R||!thCatOf(code,"rel"))return;
  /* the regions, inside the country's outline (drawn once) */
  ctx.save();ctx.beginPath();path(f);ctx.clip();
  R.forEach(r=>{const rk=r.main&&focusHas(r.main)?r.main:null;if(!rk&&!k)return;const rv=visPart(E,r.f);if(!rv)return;
   if(!rk){ctx.fillStyle=GREY;ctx.beginPath();path(r.f);ctx.fill();ctx.fillStyle=SYM_FILL;return}
   if(r.bands&&Math.max(rv.sw,rv.sh)>=4)drawBands(E,r.f,rv,r.bands,[r.f],anchorOf(f));else drawPlain(E,r.f,rv,SYM_OF[rk],[r.f],COL_OF[rk])});
  /* the regions' borders, faintly */
  ctx.strokeStyle="rgba(255,255,255,0.7)";ctx.lineWidth=0.8;ctx.beginPath();R.forEach(r=>{if(r.b[1][1]>=v.la0&&r.b[0][1]<=v.la1)path(r.f)});ctx.stroke();ctx.strokeStyle=SYM_FILL;ctx.restore()});
 ctx.restore()}
function patchGlobe(){try{if(typeof amGlobe!=="undefined"&&amGlobe&&!amGlobe._relPatched){const d0=amGlobe.cfg.drawExtra;
  amGlobe.cfg.drawExtra=(ctx,p,gv)=>{if(d0)d0(ctx,p,gv);try{globeDraw(ctx,p,gv)}catch(e){console.error(e)}};amGlobe._relPatched=true;amGlobe.request()}}catch(e){}}
{const _gs=amGlobeSync;amGlobeSync=function(){const r=_gs.apply(this,arguments);patchGlobe();return r}}

/* ---------- legend: symbol on the colour, and the sources ---------- */
{const _lh=thLegendHTML;thLegendHTML=function(){let h=_lh.apply(this,arguments);if(!h||!relOn())return h;
 CATS.forEach(([k,,col,sym])=>{h=h.replace(new RegExp(`(data-th="${k}"[^>]*>)<i style="background:${col}"></i>`),`$1<i class="gf-rel-sw" style="background:${col}"><svg viewBox="0 0 24 24" aria-hidden="true">${symSVG(sym,"rgba(255,255,255,0.92)")}</svg></i>`)});
 /* the mixed look, in one line, with a striped swatch, before the sources */
 const sw=`<i class="gf-rel-sw gf-rel-mix" aria-hidden="true"></i>`;
 return h.replace(/<span class="legend-note">/,`<span class="legend-note gf-rel-mixnote">${sw}${MIX_LINE}</span><span class="legend-note">`)}}
const css=document.createElement("style");css.textContent=`.legend-swatch i.gf-rel-sw{width:22px;height:22px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;flex:none}.legend-swatch i.gf-rel-sw svg{width:82%;height:82%;display:block}.gf-rel-mixnote{display:flex;align-items:center;gap:6px}.gf-rel-mixnote i.gf-rel-mix{width:22px;height:16px;border-radius:3px;flex:none;background:repeating-linear-gradient(135deg,#3e9a62 0 5px,#8ea8c9 5px 9px)}`;
document.head.appendChild(css);

/* ---------- hover: every group's share, for the country or, where it has its own figures, the region ---------- */
const pc=n=>n>=99.5?"over 99%":(n<10&&n%1?n.toFixed(1):Math.round(n))+"%";
function regionText(r){return r.sh.filter(x=>x[1]>=1).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,n,rest])=>rest?`others ${pc(n)} (not broken down)`:`${LABEL[k]||k} ${pc(n)}`).join(", ")}
function countryText(dc,k){const g=COMP[dc];if(!g)return null;
 const br=k&&BRANCH.C.includes(k)&&k!=="chr"?"C":k&&BRANCH.M.includes(k)&&!NOTE[dc]?"M":null,brName={cat:"Catholic",prot:"Protestant",orth:"Orthodox",sun:"Sunni",shi:"Shia",ibd:"Ibadi"}[k];
 return g.filter(x=>x[1]>=1).slice(0,6).map(([l,n])=>`${GROUP[l]} ${pc(n)}`+(l===br&&brName?` (mostly ${brName})`:"")).join(", ")}
{const _hv=allMapsHoverValue;allMapsHoverValue=function(code){const v=_hv.apply(this,arguments);if(!relOn()||!v||!code)return v;
 const info=TERRITORY_INFO[code],dc=info&&info.countsAs||code;const k=thCatOf(code,"rel"),row=k&&thCatRow(T,k);if(!row)return v;
 const t=countryText(dc,k);let txt=t?t+" (Pew 2020)":row[1]+" (CIA World Factbook)";
 if(NOTE[dc])txt+="; "+NOTE[dc];return[txt,v[1]]}}
{const _ht=allMapsHoverText;allMapsHoverText=function(code,mx,my,svg,fallback){if(!relOn()||!code||!regionsOf(code))return _ht.apply(this,arguments);
 try{const r=regionAt(code,GLOBE_ROBINSON.invert([mx,my]));if(r){const name=allMapsCountryName(code)||code;return`${r.n}, ${name}: ${regionText(r)} (${r.src})`}}catch(e){}
 return _ht.apply(this,arguments)}}
/* a country's own line: "Nigeria: Muslim 56%, Christian 43% (Pew 2020)" (the flat map writes "name (value)", the globe "name — value") */
{const _ht2=allMapsHoverText;allMapsHoverText=function(code,mx,my,svg,fallback){const t=_ht2.apply(this,arguments);if(!relOn()||!code||typeof t!=="string")return t;
 const v=allMapsHoverValue(code),val=v&&v[0];if(!val)return t;
 if(t.endsWith(" ("+val+")"))return t.slice(0,-(val.length+3))+": "+val;if(t.endsWith(" — "+val))return t.slice(0,-(val.length+3))+": "+val;return t}}

/* the guided tour's line about the least religious places, kept in step with Pew 2020 */
try{const seen=new WeakSet;const fix=o=>{if(!o||typeof o!=="object"||seen.has(o))return;seen.add(o);if(Array.isArray(o)){o.forEach(fix);return}
 if(typeof o.stat==="string"&&o.stat.indexOf("Czechia and Estonia")>=0)o.stat=o.stat.replace("Czechia and Estonia","Czechia and Vietnam");
 Object.keys(o).forEach(key=>{const x=o[key];if(x&&typeof x==="object"&&!(x instanceof Node))fix(x)})};
 if(typeof PS_TOURS!=="undefined")fix(PS_TOURS)}catch(e){}

try{const w=document.getElementById("allMapsWrap");if(w&&relOn())applyAllMapsColorMode(w)}catch(e){}
})();
