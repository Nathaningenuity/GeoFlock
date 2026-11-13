/* GeoFlock polish RV-D: a stop-by-stop review of the four continent tours Africa, North America, South America and
   Oceania, looked at on the globe (their default mode) at 1280×860.
   1. Fixes, keyed by tour and stop title, applied when the page loads and again whenever one of these tours starts (to
      the stops psSteps() builds as well, which include stops other scripts insert). Mostly framing: the tour card covers
      the left third of the globe, so a continent framed in the middle of the globe had its western edge (West Africa,
      Liberia, the Ewe pin...) under the card, and labels on the right ran under the map key. Each fix says why, and
      changed facts cite their source.
   2. Guess-first questions (through geoflock-tourplay.js) on a few stops.
   3. Stops you can play with (listed at the start of part 3).
   geoflock-sweep-tours*.js re-set framing on every psGo, so (as in geoflock-polish-rva.js / -rvb.js) the fixed fields
   are made fixed, non-configurable getters whose setters are ignored. A field that is already non-configurable (locked
   by another file) is left alone. */
(function(){
"use strict";
if(window.gfPolishRvd)return;
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const IV=[];const every=(f,ms)=>{IV.push(setInterval(f,ms))};

/* ======================================================================== part 1: data fixes */
/* (window.__rvdTest, set only by a test page, keeps the fields configurable so values can be tried and changed) */
const LOCK=(S,k,v)=>{try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.configurable===false)return;
 Object.defineProperty(S,k,{configurable:!!window.__rvdTest,enumerable:true,get:()=>v,set:()=>{}})}catch(e){try{S[k]=v}catch(err){}}};
/* swap one phrase in a text field (only if it is still there), then lock the field */
const RE=(S,k,a,b)=>{const t=String(S[k]==null?"":S[k]);if(t.indexOf(a)<0)return;LOCK(S,k,t.split(a).join(b))};
const pinText=p=>Array.isArray(p)?String(p[1]||""):String(p&&p.text||"");
/* drop the text pins whose label matches */
const DROP=(S,re)=>{const P=S.pins||[];const Q=P.filter(p=>!re.test(pinText(p)));if(Q.length!==P.length)LOCK(S,"pins",Q)};
/* move a text pin's anchor (the dot the label hangs from) */
const MOVEPIN=(S,re,at)=>{LOCK(S,"pins",(S.pins||[]).map(p=>Array.isArray(p)&&re.test(p[1])?[at,p[1],p[2]]:p))};
/* the whole continent beside the card: lon/lat of the globe's centre and zoom, found by projecting Dakar, Monrovia,
   Cape Guardafui, Madagascar and Cape Agulhas and keeping them all between the card and the edge of the globe */
const AFRICA_WIDE=[-6,3,1.1];
/* the same for North America: western Alaska, St John's (Newfoundland), Ellesmere Island, Miami and Panama */
const NA_WIDE=[-136,44,1];
/* and South America: Talara (its western tip), Bogotá, Caracas, Recife and Cape Horn */
const SA_WIDE=[-73,-18,1.15];

const FIX={
 africa:{
  "Africa":S=>{LOCK(S,"globe",AFRICA_WIDE)},
  "Room for three giants":S=>{LOCK(S,"globe",AFRICA_WIDE)},
  /* Algeria, the answer, was half under the card */
  "The biggest countries":S=>{LOCK(S,"globe",AFRICA_WIDE)},
  /* Nigeria, the answer, was under the card. Figures: UN World Population Prospects 2024, estimates for 2025 (Nigeria
     237.5 million, Ethiopia 135.5, Egypt 118.4, DR Congo 112.8, Tanzania 70.5). The same source no longer has Nigeria
     passing the US by 2050 (about 359 against 381 million then), but later this century. */
  "Most people":S=>{LOCK(S,"globe",AFRICA_WIDE);
   LOCK(S,"list",[["Nigeria","~238 million"],["Ethiopia","~135 million"],["Egypt","~118 million"],["DR Congo","~113 million"],["Tanzania","~70 million"]]);
   RE(S,"body","Nigeria has about 230 million people","Nigeria has about 238 million people");
   RE(S,"body","By 2050 it may pass the United States as the world’s third most populous country.","Later this century it is expected to pass the United States as the world’s third most populous country.")},
  /* Mauritania and the western Sahara were under the card, Emi Koussi's label ran under the map key. Two US outlines
     lay on top of each other (the stop's own "drag me" one and a second "true size" ghost, whose label was hidden under
     the first): one is enough */
  "The Sahara is mostly rock":S=>{LOCK(S,"globe",[2,23,1.75]);LOCK(S,"ghosts",[])},
  /* the "Egypt" pin only repeated the map's own country label next to it */
  "The pyramids":S=>{DROP(S,/^Egypt$/);RE(S,"more","with about 115 million people","with about 118 million people")},
  /* the "Congo crosses the equator twice" label and Victoria Falls ran under the map key */
  "Africa’s other great rivers":S=>{LOCK(S,"globe",[12,-1,1.45])},
  /* the Avenue of the Baobabs (Madagascar) hung off the bottom of the screen */
  "Wild Africa":S=>{LOCK(S,"globe",[37,-13,2.1])},
  "Straight-line borders":S=>{LOCK(S,"globe",AFRICA_WIDE)},
  /* the Ewe pin (Ghana and Togo) was under the card, and the Maasai label then ran under the map key */
  "Peoples split by borders":S=>{LOCK(S,"globe",[5,3,1.15])},
  /* the card sat on the right, over the railway from Mombasa to Nairobi that the stop is about: card left, and a
     little further out so both ends of the line, Mombasa and Kisumu, show */
  "A railway camp became a capital":S=>{LOCK(S,"card","left");LOCK(S,"globe",[38.6,-2.5,4.5])},
  /* Liberia, half of the answer, was under the card */
  "Never colonised":S=>{LOCK(S,"globe",AFRICA_WIDE)},
  /* the Gambia was a thin sliver at the far edge of the view: closer, so the river and the country show */
  "A river country":S=>{LOCK(S,"globe",[-16.3,13.4,7])},
  /* Lesotho was a small patch at the far edge of the view: closer (6 is the tours' highest zoom) and nearer the middle */
  "The kingdom in the sky":S=>{LOCK(S,"globe",[30.2,-29.5,6])},
  /* the Bloemfontein label ran under the map key: a little further out and turned east, all three labels show */
  "South Africa’s balancing act":S=>{LOCK(S,"globe",[30,-29,3.5])},
  /* "the dense cluster of small countries in West Africa" was under the card */
  "Now explore":S=>{LOCK(S,"globe",AFRICA_WIDE)}
 },
 namerica:{
  /* Alaska was under the card. Turned west, the whole continent shows beside the card, Alaska to Newfoundland
     (the Caribbean then sits near the far edge; the Caribbean stops come later) */
  "North America":S=>{LOCK(S,"globe",NA_WIDE)},
  /* the card sat on the right, over eastern Canada and the US and over the "drag me" label of the US outline */
  "Three giants":S=>{LOCK(S,"card","left");LOCK(S,"globe",NA_WIDE)},
  /* the Yukon and British Columbia, a third of Canada's coast, were under the card */
  "Canada’s water":S=>{LOCK(S,"globe",[-119,58,1.2])},
  /* the card sat on the right, over the eastern half of the border (Great Lakes to Maine); with the whole border
     beside the card, the two-line Northwest Angle label ran under the map key: a shorter one-line label */
  "The longest border":S=>{LOCK(S,"card","left");LOCK(S,"globe",[-124,52,1.12]);
   LOCK(S,"pins",(S.pins||[]).map(p=>Array.isArray(p)&&/^Northwest Angle/.test(p[1])?[p[0],"Northwest Angle (US)",p[2]]:p))},
  /* New York, one end of the comparison, was under the card */
  "Greenland belongs to North America":S=>{LOCK(S,"globe",[-66,55,1.3])},
  /* the "Rocky Mountains" pin sat on the Boise and Salt Lake City buttons of the rain game: the stop's headline names
     the Rockies already */
  "Mountains and rivers":S=>{DROP(S,/^Rocky Mountains$/)},
  /* Panama and Costa Rica were at the far edge, half under a photo: the seven countries now sit in the open, for the
     "pack them into Texas" game (part 3) */
  "Smaller than Texas":S=>{LOCK(S,"globe",[-87,18,2.1])},
  /* Columbia, the southern end of the Fall Line, was under the card */
  "Cities on the waterfall line":S=>{LOCK(S,"globe",[-81,37,5.2])},
  /* the Grand Canyon and Moraine Lake photos had nothing to do with languages and hung from points under the card */
  "Three languages":S=>{LOCK(S,"globe",[-112,40,1.05]);
   const P=S.phPins||[];const Q=P.filter(p=>!/^(United States: Grand Canyon|Canada: Moraine Lake)/.test(p&&p.label||""));if(Q.length!==P.length)LOCK(S,"phPins",Q)},
  /* "follow the Rockies from Alaska to Mexico": Alaska was under the card */
  "Now explore":S=>{LOCK(S,"globe",NA_WIDE)}
 },
 samerica:{
  /* Peru, Ecuador and the Andes, "its west", were under the card */
  "South America":S=>{LOCK(S,"globe",SA_WIDE)},
  /* the Washington, D.C. photo hung under the map's toolbar at the top: turned a little north, Washington's photo
     and Cape Horn both show */
  "Further east than you think":S=>{LOCK(S,"globe",[-75,2,1])},
  /* the Ecuador pin, the "east to west" label and the "drag me" label of the US outline were under the card; the
     "east to west" label then ran under the map key, so it now hangs from the middle of Brazil */
  "Brazil is half the continent":S=>{LOCK(S,"globe",[-75,-14,1]);MOVEPIN(S,/^Brazil, east to west/,[[-60,-9]])},
  /* the Buenos Aires and Pampas labels ran under the map key */
  "Rich from frozen beef":S=>{LOCK(S,"globe",[-59.5,-35,4.63])},
  /* "about 1,000 km off Ecuador", but Ecuador was off the screen: both now show */
  "Darwin’s islands":S=>{LOCK(S,"globe",[-85,-1,2.3])},
  /* the "French Guiana: part of France" label ran under the map key */
  "Europe in South America":S=>{LOCK(S,"globe",[-51,4,4.85])},
  /* "follow the Andes from Venezuela to Tierra del Fuego": the Andes were under the card */
  "Now explore":S=>{LOCK(S,"globe",SA_WIDE)}
 },
 oceania:{
  /* Western Australia (Perth's photo hung from a point under the card) was under the card. The tour's blurb promises
     "Australia is wider than the Moon", but that stop was merged into this one without its Moon: it is back, to drag.
     Moon: 3,474 km across (NASA Moon fact sheet, mean radius 1,737.4 km); Australia: about 4,000 km from Steep Point
     to Cape Byron (Geoscience Australia, "Continental extremities"). */
  "Australia is most of it":S=>{LOCK(S,"globe",[121,-27,1.05]);
   if(!S.drag)LOCK(S,"drag",{kind:"moon",at:[134,-25],label:"The Moon · drag me",only:"globe"});
   const b=String(S.body||"");if(b&&!/Moon/.test(b))LOCK(S,"body",b+" On the globe, drag the Moon onto it: Australia, about 4,000 km across, is wider than the Moon, 3,474 km.")},
  /* the "Rain soaks in here" label ran under the map key */
  "Water from under the desert":S=>{LOCK(S,"globe",[147.5,-25,2.5])},
  /* two Italys: the stop's own true-size Italy beside the reef, and a second "drag me" Italy added on top of the reef
     by geoflock-tourplay.js (which adds one only to stops that have none). Keep the stop's own. */
  "The Great Barrier Reef":S=>{if((S.ghosts||[]).length)LOCK(S,"drag",null);
   /* without the second Italy the "About 2,300 km of reefs" label settles lower, under the map key: turn a little east */
   LOCK(S,"globe",[149.5,-18.5,4.05])},
  /* the Sydney Opera House photo sat on the globe's zoom and rotate buttons */
  "A capital in the bush":S=>{LOCK(S,"globe",[150.8,-35.5,5.46])},
  /* the card sat on the right, and the map's legend ("Tuvalu / Other atoll countries") lay across its top edge */
  "Tuvalu’s lucky letters":S=>{LOCK(S,"card","left");LOCK(S,"globe",[176,-2,2.66])},
  /* the Gilbert Islands, where Kiribati's capital is, sat at the edge of the card */
  "Big ocean states":S=>{LOCK(S,"globe",[178,-1,1.4])}
 }
};
const applied=new WeakSet();
function applyTo(tour,steps){const F=FIX[tour];if(!F||!steps)return;steps.forEach(S=>{if(!S||applied.has(S))return;const f=F[strip(S.title)];if(!f)return;applied.add(S);
 try{f(S)}catch(e){console.error("rvd fix",tour,S.title,e)}})}
function applyAll(){try{Object.keys(FIX).forEach(t=>{const T=PS_TOURS[t];if(T)applyTo(t,T.steps)})}catch(e){}}
let lastKey="";
every(()=>{try{const t=typeof ps!=="undefined"&&ps&&ps.tour;if(!t||!FIX[t]){lastKey="";return}const k=t+"|"+ps.i;if(k===lastKey)return;lastKey=k;applyTo(t,psSteps())}catch(e){}},300);
try{applyAll()}catch(e){}setTimeout(applyAll,1500);setTimeout(applyAll,6000);

/* "Mountains and rivers" (geoflock-interact-world3.js, the rain game): at the game's zoom the labels of Salt Lake City
   and Denver, and of Chicago and Pittsburgh, sat on top of each other. Nudge those two labels sideways (their own code
   only sets left/top, never transform). */
every(()=>{try{if(typeof ps==="undefined"||!ps||ps.tour!=="namerica"||ps.mode!=="globe")return;const S=psSteps()[ps.i];if(!S||strip(S.title)!=="Mountains and rivers")return;
 document.querySelectorAll(".gw3-tag.gw3-small").forEach(d=>{const t=d.textContent||"";const tr=/Salt Lake City/.test(t)?"translate(-92%,0)":/Chicago/.test(t)?"translate(-88%,0)":/Pittsburgh/.test(t)?"translate(-12%,0)":/Boise/.test(t)?"translate(-80%,-26px)":"";
  if(tr&&d.style.transform!==tr)d.style.transform=tr})}catch(e){}},400);

/* ======================================================================== part 2: guess first
   geoflock-tourplay.js veils the stop's headline and asks for an estimate first. */
function addPlay(){try{const TP=window.gfTourPlay;if(!TP||!TP.GUESS)return false;
 const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
 const GS={
  /* UN World Population Prospects 2024, estimate for 2025: 237.5 million */
  "africa|Most people":G("How many people live in Nigeria, Africa’s most populous country?",20,500,238,"million",{step:1,show:"about 238 million"}),
  /* Nile Basin Initiative: the basin is shared by 11 countries (the stop's own figure) */
  "africa|The Nile":G("The Nile’s basin, the land that drains into it, covers parts of how many countries?",1,20,11,"",{step:1,show:"11 countries"}),
  /* Statistics Greenland, 1 January 2024: 56,699 */
  "namerica|Greenland belongs to North America":G("How many people live in Greenland, the world’s biggest island?",1000,10000000,56000,"",{log:1,show:"about 56,000"}),
  /* Natural Resources Canada / CIA World Factbook: 243,042 km (the stop's own figure) */
  "namerica|Canada’s water":G("How long is Canada’s coastline, counting all its islands?",1000,1000000,243000,"km",{log:1,show:"about 243,000 km"}),
  /* the stop's own figure: 979 m */
  "samerica|Two great waterfalls":G("How tall is Angel Falls, the highest waterfall on Earth?",50,3000,979,"m",{step:10,show:"979 m"}),
  /* Mortimer et al., "Zealandia: Earth's hidden continent", GSA Today, 2017: about 94% submerged */
  "oceania|New Zealand":G("How much of Zealandia, the hidden continent New Zealand sits on, lies under the sea?",0,100,94,"%",{step:1,show:"about 94%"}),
  /* ABS, National, state and territory population, June 2024: the ACT about 474,000 of 27.2 million Australians */
  "oceania|A capital in the bush":G("What share of Australians live in Canberra, their capital?",0,30,1.7,"%",{step:.1,show:"about 1.7%: under 2 in 100"})
 };
 /* the Great Barrier Reef already has its own Italy (see part 1) */
 if(TP.DRAG)delete TP.DRAG["oceania|The Great Barrier Reef"];
 for(const k in GS)if(!TP.GUESS[k])TP.GUESS[k]=GS[k];return true}catch(e){return false}}
if(!addPlay()){let n=0;const iv=setInterval(()=>{if(addPlay()||++n>40)clearInterval(iv)},500)}

/* ======================================================================== part 3: stops you can play with
   Same pattern as geoflock-interact-world3.js / geoflock-polish-rva.js: a watchdog polls `ps`, matches the stop by tour
   and title, mounts a layer in amGlobe.host (for the globe ones) drawn with amGlobe.projection(), adds a control block
   after the stop's headline with a one-line instruction, and removes everything (layer, card block, timers) as soon as
   the stop changes or the tour ends. Next and Back are never blocked; every step is wrapped in try/catch. CSS classes
   start with "rvd-".
   - africa   | "The kingdom in the sky": raise the sea. Find the level that drowns the whole UK but leaves all of
                Lesotho dry (a 55 m window).
   - namerica | "Smaller than Texas": stack the seven Central American countries against Texas; they light up on the
                globe.
   - samerica | "Further east than you think": which city is further east? Guess, then the globe draws the meridians. */
const NS="http://www.w3.org/2000/svg";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.02)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb,D=L.disc;if(D&&Math.hypot(x-D[0],y-D[1])>D[2]-1)return null;
 if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function pathOf(L,pts){let d="",pen=false,px=0,py=0;const G=g(),J=G&&G.size?G.size().w*.3:1e9;for(const ll of pts){const q=proj(L,ll);if(!q){pen=false;continue}
 if(!pen||Math.abs(q[0]-px)+Math.abs(q[1]-py)>J){d+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=true}else d+="L"+q[0].toFixed(1)+" "+q[1].toFixed(1);px=q[0];py=q[1]}return d}
function geoD(geom){const G=g();try{return d3.geoPath(G.projection())(geom)||""}catch(e){return""}}
function svgEl(parent,tag,attrs,html){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;parent.appendChild(e);return e}
function tag(L,cls){const d=document.createElement("div");d.className="rvd-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rvd-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rvd-new");void e.offsetWidth;e.classList.add("rvd-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function feat(code){try{return projFeatures().find(f=>f.properties&&String(f.properties.c).toLowerCase()===code)||null}catch(e){return null}}
function quiet(el){["mousedown","pointerdown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"&&t!=="pointerdown"}))}

/* ======================================================================== 1. Raise the sea (Lesotho)
   Ben Nevis, the UK's highest point: 1,345 m (Ordnance Survey). Lesotho: lowest point about 1,400 m, where the
   Makhaleng meets the Orange (Senqu) River; highest point Thabana Ntlenyana, 3,482 m (CIA World Factbook, Lesotho).
   The profiles are sketches; only the three heights are real. */
const BEN=1345,LSO_LO=1400,LSO_HI=3482,TOP=3600;
const FLOOD={tours:["africa"],title:"The kingdom in the sky",globe:false,
 tip:"Raise the sea. Can you drown the whole UK and keep all of Lesotho dry?",
 card(L){return'<svg class="rvd-xs" viewBox="0 0 300 150" role="img" aria-label="The UK and Lesotho, side by side, with a rising sea"><defs><linearGradient id="rvdSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4aa3df"/><stop offset="1" stop-color="#1d5f99"/></linearGradient></defs>'+
  '<path class="rvd-land" d="'+this.uk()+'"/><path class="rvd-land rvd-lso" d="'+this.lso()+'"/>'+
  '<rect class="rvd-sea" x="0" width="300" fill="url(#rvdSea)"/>'+
  '<line class="rvd-mark" x1="0" x2="300"/><text class="rvd-lab" x="62" y="146" text-anchor="middle">UK</text><text class="rvd-lab" x="210" y="146" text-anchor="middle">Lesotho</text>'+
  '<text class="rvd-pk" x="62" y="'+(this.y(BEN)-5).toFixed(1)+'" text-anchor="middle">Ben Nevis 1,345 m</text><text class="rvd-pk" x="222" y="'+(this.y(LSO_HI)+9).toFixed(1)+'" text-anchor="start" dx="6">3,482 m</text><text class="rvd-pk rvd-lo" x="140" y="'+(this.y(LSO_LO)+12).toFixed(1)+'">lowest 1,400 m</text></svg>'+
  '<div class="rvd-row"><input type="range" class="rvd-rng" min="0" max="'+TOP+'" step="5" value="0" aria-label="Sea level in metres"><b class="rvd-val">0 m</b></div>'},
 y(h){return 132-h/TOP*120},
 /* a rough outline of Great Britain's relief from south to north: low land, then the Highlands with Ben Nevis */
 uk(){const P=[[8,0],[20,90],[32,60],[44,300],[52,700],[62,BEN],[70,900],[80,500],[92,200],[104,0]];return"M8 132"+P.map(p=>"L"+p[0]+" "+this.y(p[1]).toFixed(1)).join("")+"L104 132Z"},
 /* Lesotho: a high plateau, its lowest valley at 1,400 m on the west and the Drakensberg (Thabana Ntlenyana) in the east */
 lso(){const P=[[140,LSO_LO],[150,1600],[162,1550],[176,2100],[190,2400],[204,2600],[216,3000],[222,LSO_HI],[232,3200],[246,2900],[258,LSO_LO+300],[264,LSO_LO+200]];return"M134 132L134 "+this.y(LSO_LO).toFixed(1)+P.map(p=>"L"+p[0]+" "+this.y(p[1]).toFixed(1)).join("")+"L264 132Z"},
 wire(L){const c=L.card,r=c.querySelector(".rvd-rng");L.h=0;L.won=false;r.oninput=()=>{L.h=+r.value;this.render(L)};this.render(L)},
 render(L){const c=L.card;if(!c)return;const h=L.h,y=this.y(h);const sea=c.querySelector(".rvd-sea");sea.setAttribute("y",y.toFixed(1));sea.setAttribute("height",(150-y).toFixed(1));
  const m=c.querySelector(".rvd-mark");m.setAttribute("y1",y.toFixed(1));m.setAttribute("y2",y.toFixed(1));
  c.querySelector(".rvd-val").textContent=fmt(h)+" m";const ukGone=h>=BEN,lsoWet=h>LSO_LO;c.querySelector(".rvd-lso").classList.toggle("rvd-wet",lsoWet);
  if(ukGone&&!lsoWet){L.won=true;say(L,"Got it: the UK is gone, Lesotho is dry","At "+fmt(h)+" m the sea covers Ben Nevis (1,345 m), the top of the UK, yet it has not reached Lesotho’s lowest valley at about 1,400 m. The window is only 55 m wide.")}
  else if(h===0)say(L,"","Drag the slider to raise the sea. Watch which country disappears first.");
  else if(!ukGone)say(L,fmt(h)+" m","Most of England is under water by now, but Ben Nevis, in the Scottish Highlands, still pokes out at 1,345 m. Lesotho has not even got its feet wet.");
  else if(h<LSO_HI)say(L,"Too high: Lesotho is flooding",(L.won?"":"Go back down a little: the UK must be gone and Lesotho dry. ")+"Above about 1,400 m the sea creeps up Lesotho’s lowest valley, where its rivers leave the country. Its mountains, up to 3,482 m, would stay islands for a long time.");
  else say(L,"Everything is under","At 3,482 m the sea covers Thabana Ntlenyana, Lesotho’s highest peak and the highest point in southern Africa.")},
 draw(){}};

/* ======================================================================== 2. Fill Texas (Central America)
   Areas, total (land and water): CIA World Factbook: Guatemala 108,889 km², Belize 22,966, El Salvador 21,041, Honduras
   112,090, Nicaragua 130,370, Costa Rica 51,100, Panama 75,420; together 521,876 km². Texas 695,662 km² (US Census
   Bureau, total area). */
const TEXAS=695662;
const CA=[["gt","Guatemala",108889,"#d9682b"],["bz","Belize",22966,"#e3a33b"],["sv","El Salvador",21041,"#2e9d5b"],["hn","Honduras",112090,"#7a5cc2"],["ni","Nicaragua",130370,"#c2364f"],["cr","Costa Rica",51100,"#2f8fe0"],["pa","Panama",75420,"#4fa3a5"]];
const STACK={tours:["namerica"],title:"Smaller than Texas",globe:true,
 tip:"Tap the countries to pack them into Texas. Do all seven fit?",
 card(L){return'<div class="rvd-chips">'+CA.map(c=>'<button type="button" class="rvd-chip" data-c="'+c[0]+'"><i style="background:'+c[3]+'"></i>'+c[1]+"</button>").join("")+'</div>'+
  '<div class="rvd-bars"><div class="rvd-blab">Texas <b>'+fmt(TEXAS)+' km²</b></div><div class="rvd-track"><i class="rvd-txbar"></i></div><div class="rvd-blab">Your stack <b class="rvd-mine"></b></div><div class="rvd-track rvd-stack"></div></div>'+
  '<div class="rvd-btns"><button type="button" class="rvd-btn rvd-fill">Pack all seven</button><button type="button" class="rvd-btn rvd-clear">Clear</button></div>'},
 init(L){L.sel=[];L.fills=svgEl(L.svg,"g",{})},
 off(L){clearInterval(L.auto)},
 wire(L){const c=L.card;c.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{clearInterval(L.auto);const k=b.dataset.c,i=L.sel.indexOf(k);if(i>=0)L.sel.splice(i,1);else L.sel.push(k);this.render(L)});
  c.querySelector(".rvd-clear").onclick=()=>{clearInterval(L.auto);L.sel=[];this.render(L)};
  c.querySelector(".rvd-fill").onclick=()=>{clearInterval(L.auto);L.sel=[];this.render(L);let i=0;
   L.auto=setInterval(()=>{try{if(!L||!L.card||!L.card.isConnected||i>=CA.length){clearInterval(L.auto);return}L.sel.push(CA[i++][0]);this.render(L)}catch(e){clearInterval(L.auto)}},550)};
  this.render(L)},
 render(L){const c=L.card;if(!c)return;const s=L.sel.reduce((a,k)=>a+CA.find(x=>x[0]===k)[2],0),mx=TEXAS*1.04;
  c.querySelectorAll("[data-c]").forEach(b=>b.classList.toggle("rvd-on",L.sel.includes(b.dataset.c)));
  c.querySelector(".rvd-mine").textContent=L.sel.length?fmt(s)+" km² · "+Math.round(s/TEXAS*100)+"%":"empty";
  c.querySelector(".rvd-txbar").style.width=(TEXAS/mx*100).toFixed(1)+"%";
  setHTML(c.querySelector(".rvd-stack"),L.sel.map(k=>{const C=CA.find(x=>x[0]===k);return'<i style="width:'+(C[2]/mx*100).toFixed(2)+"%;background:"+C[3]+'" title="'+esc(C[1])+'"></i>'}).join("")+'<em style="left:'+(TEXAS/mx*100).toFixed(1)+'%"></em>');
  const n=L.sel.length;
  if(!n)say(L,"","Start with the biggest, Nicaragua: how much of Texas does it fill?");
  else if(n===CA.length)say(L,"All seven fit, with room to spare","Together they cover about "+fmt(s)+" km², three-quarters of Texas. The "+fmt(TEXAS-s)+" km² left over would hold another Nicaragua, the biggest of the seven.");
  else{const last=CA.find(x=>x[0]===L.sel[n-1]);say(L,Math.round(s/TEXAS*100)+"% of Texas",last[1]+" adds "+fmt(last[2])+" km². "+(CA.length-n)+" more to go.")}
  L.dirty=1},
 draw(L){let h="";L.sel.forEach(k=>{const C=CA.find(x=>x[0]===k),f=feat(k);if(f)h+='<path d="'+geoD(f)+'" fill="'+C[3]+'" class="rvd-cfill"/>'});
  L.fills.setAttribute("transform","translate("+L.ox.toFixed(1)+","+L.oy.toFixed(1)+")");setHTML(L.fills,h)}};

/* ======================================================================== 3. Which is further east?
   City centres, rounded to 0.01°: Miami 25.76° N 80.19° W; Lima 12.05° S 77.04° W; New York 40.71° N 74.01° W; Santiago
   33.45° S 70.67° W; Chicago 41.88° N 87.63° W; Quito 0.18° S 78.47° W; Bogotá 4.71° N 74.07° W. */
const C=(n,lon,lat)=>({n,ll:[lon,lat]});
const EASTP=[[C("Miami",-80.19,25.76),C("Lima",-77.04,-12.05),"Lima, on the Pacific coast of South America, is east of Miami, on the Atlantic coast of North America."],
 [C("New York",-74.01,40.71),C("Santiago",-70.67,-33.45),"Santiago, Chile’s capital, is east of New York, though it sits on the Pacific side of the Andes."],
 [C("Chicago",-87.63,41.88),C("Quito",-78.47,-0.18),"Quito is almost 10° east of Chicago: fly due south from Chicago and you would miss South America and reach the Pacific."],
 [C("Bogotá",-74.07,4.71),C("New York",-74.01,40.71),"Almost a tie! New York is just 0.06° (about 5 km) further east: Bogotá lies almost due south of it."]];
const EASTQ={tours:["samerica"],title:"Further east than you think",globe:true,
 tip:"Which city is further east? Tap your answer.",
 card(L){return'<div class="rvd-q"></div><div class="rvd-btns rvd-ans"></div><div class="rvd-score"><span class="rvd-dots">'+EASTP.map(()=>"<i></i>").join("")+'</span><button type="button" class="rvd-btn rvd-next" hidden>Next pair →</button></div>'},
 init(L){L.k=0;L.res=[];L.lines=svgEl(L.svg,"g",{});L.dots=svgEl(L.svg,"g",{});L.tA=tag(L,"rvd-ctag");L.tB=tag(L,"rvd-ctag");L.tLa=tag(L,"rvd-ltag");L.tLb=tag(L,"rvd-ltag")},
 wire(L){this.ask(L)},
 ask(L){const c=L.card;if(!c)return;const p=EASTP[L.k];L.ans=null;
  setHTML(c.querySelector(".rvd-q"),"<b>Pair "+(L.k+1)+" of "+EASTP.length+":</b> which is further east?");
  const box=c.querySelector(".rvd-ans");box.innerHTML="";[0,1].forEach(j=>{const b=document.createElement("button");b.type="button";b.className="rvd-btn";b.textContent=p[j].n;b.onclick=()=>this.pick(L,j);box.appendChild(b)});
  c.querySelector(".rvd-next").hidden=true;this.dots(L);say(L,"","Guess first, then the globe draws the meridian, the north–south line, through each city.");
  /* the first pair (Miami, Lima) already shows in the stop's own view; later pairs turn the globe to them */
  if(L.asked){const m=d3.geoInterpolate(p[0].ll,p[1].ll)(.5),dd=d3.geoDistance(p[0].ll,p[1].ll);turnTo(L,m,clamp(.75/Math.sin(Math.min(1.4,dd/2+.2)),1,3))}L.asked=1;L.dirty=1},
 pick(L,j){if(L.ans!=null)return;const p=EASTP[L.k],right=p[0].ll[0]>p[1].ll[0]?0:1;L.ans=j;L.res[L.k]=j===right;
  L.card.querySelectorAll(".rvd-ans .rvd-btn").forEach((b,i)=>{b.disabled=true;if(i===right)b.classList.add("rvd-right");else if(i===j)b.classList.add("rvd-wrong")});
  const f=v=>Math.abs(v).toFixed(2)+"° W";
  say(L,(j===right?"Yes! ":"Not quite: ")+p[right].n+", at "+f(p[right].ll[0]),p[2]+" ("+p[1-right].n+": "+f(p[1-right].ll[0])+".)");
  const nx=L.card.querySelector(".rvd-next");nx.hidden=false;nx.textContent=L.k<EASTP.length-1?"Next pair →":"Start again ↺";nx.onclick=()=>{if(L.k<EASTP.length-1)L.k++;else{L.k=0;L.res=[]}this.ask(L)};this.dots(L);L.dirty=1},
 dots(L){const d=L.card&&L.card.querySelectorAll(".rvd-dots i");if(!d)return;d.forEach((e,i)=>{e.className=L.res[i]===true?"rvd-ok":L.res[i]===false?"rvd-no":i===L.k?"rvd-at":""});
  const n=L.res.filter(x=>x===true).length,done=L.res.filter(x=>x!=null).length;if(done===EASTP.length&&L.ans!=null)say(L,n+" out of "+EASTP.length+"!",n>=3?"Sharp eyes. Most people picture South America straight below North America; in fact it lies far to the east, almost all of it east of Miami.":"You are in good company: most people picture South America straight below North America, but almost all of it lies east of Miami.")},
 draw(L){const p=EASTP[L.k];if(!p)return;let lh="";
  if(L.ans!=null)[0,1].forEach(j=>{const v=p[j].ll[0],pts=[];for(let a=-60;a<=60;a+=1)pts.push([v,a]);lh+='<path d="'+pathOf(L,pts)+'" class="rvd-mer rvd-m'+j+'"/>'});setHTML(L.lines,lh);
  let dh="";[0,1].forEach(j=>{const q=proj(L,p[j].ll);if(q)dh+='<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="6" class="rvd-city rvd-m'+j+'"/>'});setHTML(L.dots,dh);
  const qa=proj(L,p[0].ll,1),qb=proj(L,p[1].ll,1);putTag(L,L.tA,qa,esc(p[0].n),10);putTag(L,L.tB,qb,esc(p[1].n),10);
  const f=v=>Math.abs(v).toFixed(1)+"° W";
  if(L.ans!=null){/* label each meridian half-way between the two cities, on its own side */
   const mid=(p[0].ll[1]+p[1].ll[1])/2,w=p[0].ll[0]<p[1].ll[0]?0:1;putTag(L,L.tLa,proj(L,[p[0].ll[0],mid],1),f(p[0].ll[0]),w===0?-26:4);putTag(L,L.tLb,proj(L,[p[1].ll[0],mid],1),f(p[1].ll[0]),w===1?-26:4)}
  else{putTag(L,L.tLa,null);putTag(L,L.tLb,null)}}};

/* ---------------- the engine: one stop at a time ---------------- */
const DEFS=[FLOOD,STACK,EASTQ];
let L=null,raf=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||!ps.card)return null;const S=psSteps()[ps.i];if(!S)return null;const t=strip(S.title);
 const D=DEFS.find(d=>d.tours.includes(ps.tour)&&d.title===t);if(!D)return null;if(D.globe&&ps.mode!=="globe")return null;return D}catch(e){return null}}
function mount(D){const G=g();const host=D.globe?(G&&G.host):null;if(D.globe&&!host)return;if(L&&L.D===D&&L.host===host&&(!host||L.el.isConnected))return;unmount();
 L={D,host,dirty:1,ox:0,oy:0,key:""};
 if(host){const el=document.createElement("div");el.className="rvd-layer";el.innerHTML='<svg class="rvd-sv"><defs><clipPath id="rvdDisc"><path class="rvd-discc" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#rvdDisc)"></g></svg>';host.appendChild(el);L.el=el;L.svg=el.querySelector("g");L.svgRoot=el.querySelector("svg");L.discC=el.querySelector(".rvd-discc")}
 try{if(D.init)D.init.call(D,L)}catch(e){console.error(e)}if(host)loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{if(L.el)L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".rvd-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||!ps.card)return;const ex=ps.card.querySelector(".rvd-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rvd-ctl";
 c.innerHTML='<div class="rvd-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rvd-ep"></div>';
 /* below a "Guess first" / "Find it" block if there is one, else right after the headline */
 const tp=ps.card.querySelector("[data-tp]");(tp&&tp.parentNode===at0.parentNode?tp:at0).after(c);L.card=c;L._said="";quiet(c);
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L||!L.host)return;raf=requestAnimationFrame(()=>{try{const G=g();
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.svgRoot.setAttribute("width",hr.width);L.svgRoot.setAttribute("height",hr.height);
   L.disc=null;try{if(!G._flat){const P=G.projection(),t=P.translate(),r=Math.min(P.scale(),G.size&&G.size().r||1e9);L.disc=[t[0]+L.ox,t[1]+L.oy,r]}}catch(e){}
   const D=L.disc,f=v=>v.toFixed(1);let cd=D?"M"+f(D[0]-D[2])+" "+f(D[1])+"a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(2*D[2])+" 0a"+f(D[2])+" "+f(D[2])+" 0 1 0 "+f(-2*D[2])+" 0Z":"M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z";
   if(cb)cd+="M"+f(cb[0])+" "+f(cb[1])+"H"+f(cb[2])+"V"+f(cb[3])+"H"+f(cb[0])+"Z";L.discC.setAttribute("d",cd);L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
/* turn the globe smoothly so a place shows beside the card, not under it */
function turnTo(L,ll,zoom){const G=g();if(!L||!G||!G.lookAt||G._flat)return;let side=0;try{const c=ps.card.getBoundingClientRect(),h=L.host.getBoundingClientRect();side=(c.left+c.right)/2>(h.left+h.right)/2?1:-1}catch(e){}
 const z=zoom||G.zoom||1,t=[ll[0]+side*28/z,ll[1]*(1-.3/Math.max(1,z))],r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,t),D=L.D;
 const step=()=>{if(!L||L.D!==D||!L.el||!L.el.isConnected)return;const f=Math.min(1,(performance.now()-T0)/1100),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0+(z-z0)*e)}catch(err){return}L.dirty=1;if(f<1)requestAnimationFrame(step)};step()}
every(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rvd-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rvd-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rvd-sv{position:absolute;left:0;top:0;overflow:visible}
.rvd-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rvd-ctag{background:#13294b;color:#fff;font-weight:800;font-size:13px;padding:3px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.rvd-ltag{background:rgba(255,255,255,.94);color:#13294b;font-weight:800;font-size:12px;padding:2px 8px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rvd-city{stroke:#fff;stroke-width:2.5}.rvd-city.rvd-m0{fill:#d9682b}.rvd-city.rvd-m1{fill:#2f8fe0}
.rvd-mer{fill:none;stroke-width:2.5;stroke-dasharray:7 5}.rvd-mer.rvd-m0{stroke:#d9682b}.rvd-mer.rvd-m1{stroke:#2f8fe0}
.rvd-cfill{opacity:.78;stroke:#fff;stroke-width:.8}
.rvd-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rvd-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rvd-q{font-size:14px;margin-bottom:2px}
.rvd-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.rvd-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvd-btn:disabled{cursor:default;opacity:.55}.rvd-btn.rvd-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rvd-btn.rvd-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rvd-score{display:flex;align-items:center;gap:10px;margin-top:8px}.rvd-score .rvd-btn{flex:0 0 auto}
.rvd-dots{display:flex;gap:4px;flex:1 1 auto}.rvd-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rvd-dots i.rvd-ok{background:#1f8a4c}.rvd-dots i.rvd-no{background:#c2364f}.rvd-dots i.rvd-at{box-shadow:0 0 0 2px #ffd166}
.rvd-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rvd-ep b{display:block;font-size:15px}
.rvd-ep.rvd-new{animation:rvdIn .45s ease}@keyframes rvdIn{from{opacity:.2;transform:translateY(4px)}}
.rvd-chips{display:flex;flex-wrap:wrap;gap:5px}
.rvd-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12px;padding:4px 9px;border-radius:999px;cursor:pointer;font-family:inherit}
.rvd-chip i{display:inline-block;width:9px;height:9px;border-radius:50%}.rvd-chip.rvd-on{background:#13294b;color:#fff;border-color:#13294b}
.rvd-bars{margin-top:10px}.rvd-blab{display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin:4px 0 2px}.rvd-blab b{color:#9a4a16}
.rvd-track{position:relative;height:14px;border-radius:7px;background:rgba(19,41,75,.1);display:flex;overflow:visible}
.rvd-txbar{display:block;height:100%;border-radius:7px;background:#13294b;transition:width .3s}
.rvd-stack i{display:block;height:100%;transition:width .3s}.rvd-stack i:first-child{border-radius:7px 0 0 7px}
.rvd-stack em{position:absolute;top:-3px;width:2px;height:20px;margin-left:-1px;background:#13294b}
.rvd-xs{display:block;width:100%;height:auto;border-radius:10px;background:linear-gradient(#eaf4fb,#fff)}
.rvd-land{fill:#9a8a5c;stroke:#5d5236;stroke-width:1}.rvd-lso{fill:#7f9a55;stroke:#4c6131}.rvd-lso.rvd-wet{fill:#6d7f55}
.rvd-sea{opacity:.82;transition:y .12s,height .12s}.rvd-mark{stroke:#fff;stroke-width:1.5;stroke-dasharray:4 3}
.rvd-lab{font:800 11px system-ui,sans-serif;fill:#13294b}.rvd-pk{font:700 9.5px system-ui,sans-serif;fill:#13294b;paint-order:stroke;stroke:#fff;stroke-width:3px}
.rvd-row{display:flex;align-items:center;gap:10px;margin-top:8px}.rvd-rng{flex:1 1 auto;accent-color:#d9682b}.rvd-val{min-width:64px;text-align:right;font-size:15px;color:#9a4a16}
:is(body.dark-theme,body.sky-night) .rvd-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rvd-do,:is(body.dark-theme,body.sky-night) .rvd-blab b,:is(body.dark-theme,body.sky-night) .rvd-val{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rvd-btn,:is(body.dark-theme,body.sky-night) .rvd-chip{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rvd-chip.rvd-on{background:#fff;color:#13294b}
:is(body.dark-theme,body.sky-night) .rvd-track,:is(body.dark-theme,body.sky-night) .rvd-dots i{background:rgba(255,255,255,.15)}:is(body.dark-theme,body.sky-night) .rvd-txbar{background:#9fc3ff}:is(body.dark-theme,body.sky-night) .rvd-stack em{background:#fff}
:is(body.dark-theme,body.sky-night) .rvd-xs{background:linear-gradient(#1d2b44,#14203a)}:is(body.dark-theme,body.sky-night) .rvd-lab{fill:#e8eefc}`;document.head.appendChild(s)}

window.gfPolishRvd={v:1,FIX,L:()=>L,stop(){IV.forEach(clearInterval);try{unmount()}catch(e){}}};
})();
