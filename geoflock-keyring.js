/* GeoFlock: small key places at tour stops. When a stop's label or photo points at a small island, island group or lake
   (Samosir and Lake Toba, the Galápagos, Cocos (Keeling)…) and that place is small on the map, a ring is drawn round it,
   the labels and photo squares are kept outside the ring, and their leader lines start at the ring's edge: no dot and no
   line end on the place itself. Places that are big on the map (zoomed in) are left as they are.
   The places are found from the map's own landform shapes (islands, island groups, lakes), only when a stop points at ONE
   such place and it is small on the map (under about 90 px); RINGS adds hand-set ones. */
(function(){
const RINGS={
 "bbeagle|Galápagos: islands of difference":[{at:[-90.55,-0.6],km:150}],
 "bbeagle|Coral atolls: Cocos (Keeling)":[{at:[96.85,-12.15],km:28}]};
const SMALL=110;/* a ring this many pixels across or more is not a small place any more */
const KINDS={islands:1,groups:1,lakes:1};
const NS="http://www.w3.org/2000/svg";
let IDX=null;
function index(){if(IDX)return IDX;IDX=[];try{(gfSearch.build()||[]).forEach(e=>{if(!KINDS[e.cat]||!e.g||!/Polygon/.test(e.g.type))return;try{const b=d3.geoBounds(e.g);if(b[1][0]<b[0][0])return;IDX.push({e,b})}catch(x){}})}catch(x){IDX=null}return IDX||[]}
/* the smallest island, group or lake that holds (or nearly holds) a point */
function placeAt(ll){let best=null,ba=1e9;for(const it of index()){const b=it.b,pad=.15;if(ll[0]<b[0][0]-pad||ll[0]>b[1][0]+pad||ll[1]<b[0][1]-pad||ll[1]>b[1][1]+pad)continue;
  const a=(b[1][0]-b[0][0])*(b[1][1]-b[0][1]);if(a>=ba)continue;let inside=false;try{inside=d3.geoContains(it.e.g,ll)||Math.abs(ll[0]-(b[0][0]+b[1][0])/2)<(b[1][0]-b[0][0])/2+.05&&Math.abs(ll[1]-(b[0][1]+b[1][1])/2)<(b[1][1]-b[0][1])/2+.05}catch(x){}
  if(inside){best=it;ba=a}}return best}
let KEY="",RS=[];
function rings(){try{if(typeof ps==="undefined"||!ps)return[];const S=psSteps()[ps.i];if(!S)return[];const k=ps.tour+"|"+ps.i+"|"+S.title;if(k===KEY)return RS;KEY=k;
  const set=RINGS[ps.tour+"|"+S.title]||(S.gfFrom&&RINGS[S.gfFrom]);if(set){RS=set.map(r=>Object.assign({},r));return RS}
  const anchors=[];(S.pins||[]).forEach(p=>{if(Array.isArray(p)&&Array.isArray(p[0])&&typeof p[0][0]==="number"&&p[2]!=="area")anchors.push(p[0])});(S.phPins||[]).forEach(q=>{if(q&&q.at)anchors.push(q.at)});
  const seen=new Map();anchors.forEach(a=>{const it=placeAt(a);if(!it)return;const b=it.b,c=[(b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2];
   const km=Math.max(6,d3.geoDistance(b[0],b[1])*6371/2*1.15);if(km>300)return;seen.set(it.e.n,{at:c,km,n:it.e.n})});
  /* only a stop about ONE small place gets an automatic ring (Samosir in Lake Toba); several small places pointed at
     (Bali, Lombok, Komodo at the Wallace Line) are a comparison, not a hidden spot: no rings there */
  RS=seen.size===1?[...seen.values()].map(r=>Object.assign(r,{auto:1})):[];return RS}catch(e){return[]}}
function ringSvg(box,n){let s=box.querySelector("svg.gf-keyring");if(!s){s=document.createElementNS(NS,"svg");s.setAttribute("class","gf-keyring");s.setAttribute("aria-hidden","true");box.appendChild(s)}
 if(s.childElementCount!==2*n){s.innerHTML="";for(let i=0;i<n;i++)s.insertAdjacentHTML("beforeend",'<circle class="h"/><circle class="r"/>')}return s}
function clear(){document.querySelectorAll("svg.gf-keyring").forEach(x=>x.remove())}
function boxEdge(cx,cy,b){const bx=b.l+b.w/2,by=b.t+b.h/2,dx=cx-bx,dy=cy-by;if(!dx&&!dy)return[bx,by];const k=Math.min(Math.abs((b.w/2)/(dx||1e-9)),Math.abs((b.h/2)/(dy||1e-9)),1);return[bx+dx*k,by+dy*k]}
function hitsCircle(b,cx,cy,R){const x=Math.max(b.l,Math.min(cx,b.l+b.w)),y=Math.max(b.t,Math.min(cy,b.t+b.h));return Math.hypot(x-cx,y-cy)<R}
function apply(){const RR=rings();const box=RR.length&&typeof psContainer==="function"&&psContainer();if(!box){clear();return}
 /* each ring on screen; only the small ones are kept */
 const C=[];RR.forEach(K=>{const c=psScreen(K.at),n=c&&psScreen([K.at[0],K.at[1]+K.km/111.2]);if(!c||!n)return;const R=Math.max(14,Math.hypot(n[0]-c[0],n[1]-c[1]));if(2*R<(K.auto?90:SMALL))C.push({c,R,K})});
 if(!C.length){clear();return}
 const s=ringSvg(box,C.length);[...s.children].forEach((e,i)=>{const r=C[i>>1];e.setAttribute("cx",r.c[0].toFixed(1));e.setAttribute("cy",r.c[1].toFixed(1));e.setAttribute("r",r.R.toFixed(1))});
 const br=box.getBoundingClientRect(),W=box.clientWidth,H=box.clientHeight;const S=psSteps()[ps.i];
 /* the labels and photo squares, each with the place it points at */
 const items=[];
 box.querySelectorAll(".ps-pins .ps-lab").forEach((el,k)=>{const P=ps.pins&&ps.pins[k];if(!P||!P.at||!P.at[0])return;items.push({el,sq:false,a:P.at[0]})});
 box.querySelectorAll(".ps-phpins .ps-sq").forEach(el=>{const q=(S.phPins||[])[+el.dataset.ph];if(q&&q.at)items.push({el,sq:true,a:q.at})});
 const placed=[];
 items.forEach(it=>{if(it.el.style.display==="none"||!it.el.offsetParent)return;const q=it.el.getBoundingClientRect();let b={l:q.left-br.left,t:q.top-br.top,w:q.width,h:q.height};it.b=b;
  const a=psScreen(it.a);if(!a)return;it.ring=C.find(r=>Math.hypot(a[0]-r.c[0],a[1]-r.c[1])<=r.R+2)||null;
  const hit=C.find(r=>hitsCircle(b,r.c[0],r.c[1],r.R+12));
  if(hit){const r=it.ring||hit,room=r.R+12;let ang=Math.atan2(b.t+b.h/2-r.c[1],b.l+b.w/2-r.c[0]);if(!isFinite(ang))ang=-Math.PI/2;
   for(let tries=0;tries<16;tries++){const an=ang+(tries%2?1:-1)*Math.ceil(tries/2)*.42,d=room+Math.hypot(b.w,b.h)/2+4,x=r.c[0]+Math.cos(an)*d-b.w/2,y=r.c[1]+Math.sin(an)*d-b.h/2;
    const nb={l:Math.max(4,Math.min(W-b.w-4,x)),t:Math.max(4,Math.min(H-b.h-4,y)),w:b.w,h:b.h};
    if(!C.some(rr=>hitsCircle(nb,rr.c[0],rr.c[1],rr.R+12))&&!placed.some(p=>!(nb.l+nb.w<p.l||p.l+p.w<nb.l||nb.t+nb.h<p.t||p.t+p.h<nb.t))){b=nb;break}}
   it.el.style.left=(it.sq?b.l+b.w/2:b.l)+"px";it.el.style.top=(it.sq?b.t+b.h/2:b.t)+"px";it.b=b}
  placed.push(it.b)});
 /* leader lines and dots that start inside a ring are taken away; new lines run from the ring's edge to each label */
 const inR=(x,y)=>C.some(r=>Math.hypot(x-r.c[0],y-r.c[1])<r.R+1);
 box.querySelectorAll("svg.ps-leaders, svg.ps-sq-lead").forEach(sv=>{[...sv.children].forEach(e=>{const t=e.tagName.toLowerCase();
   if(t==="line"&&inR(+e.getAttribute("x1"),+e.getAttribute("y1")))e.remove();else if(t==="circle"&&inR(+e.getAttribute("cx"),+e.getAttribute("cy")))e.remove();else if((t==="path"||t==="g")&&e.getBBox){try{const bb=e.getBBox();if(inR(bb.x+bb.width/2,bb.y+bb.height/2))e.remove()}catch(x){}}})});
 const lead=box.querySelector(".ps-pins svg.ps-leaders")||box.querySelector("svg.ps-sq-lead");
 if(lead){let html="";items.forEach(it=>{const r=it.ring;if(!r||!it.b)return;const b=it.b,bx=b.l+b.w/2,by=b.t+b.h/2,d=Math.hypot(bx-r.c[0],by-r.c[1]);if(d<r.R+4)return;
   const u=[(bx-r.c[0])/d,(by-r.c[1])/d],a=[r.c[0]+u[0]*(r.R+3),r.c[1]+u[1]*(r.R+3)],e=boxEdge(r.c[0],r.c[1],b);if(Math.hypot(e[0]-a[0],e[1]-a[1])<6)return;
   html+=`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${e[0].toFixed(1)}" y2="${e[1].toFixed(1)}" class="ps-ldr-h gf-kr-l"/><line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${e[0].toFixed(1)}" y2="${e[1].toFixed(1)}" class="ps-ldr gf-kr-l"/>`});
  lead.insertAdjacentHTML("beforeend",html)}}
{const _p=psPlacePins;psPlacePins=function(){const r=_p.apply(this,arguments);try{apply()}catch(e){console.error(e)}return r}}
{const _e=psEnd;psEnd=function(){clear();KEY="";return _e.apply(this,arguments)}}
setInterval(()=>{try{if(typeof ps==="undefined"||!ps)clear()}catch(e){}},600);
{const st=document.createElement("style");st.textContent=`svg.gf-keyring{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;overflow:visible}
svg.gf-keyring circle{fill:none}svg.gf-keyring .h{stroke:rgba(10,20,40,.55);stroke-width:5}svg.gf-keyring .r{stroke:#fff;stroke-width:2.2}`;document.head.appendChild(st)}
window.gfKeyRing={RINGS,apply,rings};
})();
