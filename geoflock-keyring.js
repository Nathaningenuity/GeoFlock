/* GeoFlock: small key places at tour stops (the Galápagos, Cocos (Keeling)…). When the place is small on the map, a ring is
   drawn round it, and the stop's labels and photo squares are moved out of the ring so they never cover it; their leader
   lines start at the ring's edge (no dot, no point on the place itself) and point in at it. When the place is big on the
   map (zoomed in), nothing changes. */
(function(){
const RINGS={
 "bbeagle|Galápagos: islands of difference":{at:[-90.55,-0.6],km:150},
 "bbeagle|Coral atolls: Cocos (Keeling)":{at:[96.85,-12.15],km:28}};
const SMALL=110;/* a ring this many pixels across or more is not a small place any more: nothing is done */
const cur=()=>{try{if(typeof ps==="undefined"||!ps)return null;const S=psSteps()[ps.i];return S&&(RINGS[ps.tour+"|"+S.title]||(S.gfFrom&&RINGS[S.gfFrom])||S.keyRing)||null}catch(e){return null}};
const NS="http://www.w3.org/2000/svg";
function ringSvg(box){let s=box.querySelector("svg.gf-keyring");if(!s){s=document.createElementNS(NS,"svg");s.setAttribute("class","gf-keyring");s.setAttribute("aria-hidden","true");
  s.innerHTML='<circle class="h"/><circle class="r"/>';box.appendChild(s)}return s}
function clear(){document.querySelectorAll("svg.gf-keyring").forEach(x=>x.remove())}
/* the point where the segment from the circle's centre to a box's centre leaves the box */
function boxEdge(cx,cy,b){const bx=b.l+b.w/2,by=b.t+b.h/2,dx=cx-bx,dy=cy-by;if(!dx&&!dy)return[bx,by];const k=Math.min(Math.abs((b.w/2)/(dx||1e-9)),Math.abs((b.h/2)/(dy||1e-9)),1);return[bx+dx*k,by+dy*k]}
function hitsCircle(b,cx,cy,R){const x=Math.max(b.l,Math.min(cx,b.l+b.w)),y=Math.max(b.t,Math.min(cy,b.t+b.h));return Math.hypot(x-cx,y-cy)<R}
function apply(){const K=cur();const box=K&&typeof psContainer==="function"&&psContainer();if(!K||!box){clear();return}
 const c=psScreen(K.at),n=c&&psScreen([K.at[0],K.at[1]+K.km/111.2]);if(!c||!n){clear();return}
 const R=Math.max(16,Math.hypot(n[0]-c[0],n[1]-c[1]));if(2*R>=SMALL){clear();return}
 const s=ringSvg(box);s.querySelectorAll("circle").forEach(e=>{e.setAttribute("cx",c[0].toFixed(1));e.setAttribute("cy",c[1].toFixed(1));e.setAttribute("r",R.toFixed(1))});
 const br=box.getBoundingClientRect(),W=box.clientWidth,H=box.clientHeight,room=R+12;
 /* the labels and photo squares, pushed out of the ring (and apart from each other) */
 const items=[];box.querySelectorAll(".ps-pins .ps-lab, .ps-phpins .ps-sq").forEach(el=>{if(el.style.display==="none"||!el.offsetParent)return;const q=el.getBoundingClientRect();
  const sq=el.classList.contains("ps-sq");/* squares are placed by their centre, labels by their top-left corner */
  items.push({el,sq,b:{l:q.left-br.left,t:q.top-br.top,w:q.width,h:q.height}})});
 const placed=[];
 items.forEach(it=>{let b=it.b;if(hitsCircle(b,c[0],c[1],room)){let ang=Math.atan2(b.t+b.h/2-c[1],b.l+b.w/2-c[0]);if(!isFinite(ang))ang=-Math.PI/2;
   for(let tries=0;tries<16;tries++){const a=ang+(tries%2?1:-1)*Math.ceil(tries/2)*.42,d=room+Math.hypot(b.w,b.h)/2+4,x=c[0]+Math.cos(a)*d-b.w/2,y=c[1]+Math.sin(a)*d-b.h/2;
    const nb={l:Math.max(4,Math.min(W-b.w-4,x)),t:Math.max(4,Math.min(H-b.h-4,y)),w:b.w,h:b.h};
    if(!hitsCircle(nb,c[0],c[1],room)&&!placed.some(p=>!(nb.l+nb.w<p.l||p.l+p.w<nb.l||nb.t+nb.h<p.t||p.t+p.h<nb.t))){b=nb;break}}
   it.el.style.left=(it.sq?b.l+b.w/2:b.l)+"px";it.el.style.top=(it.sq?b.t+b.h/2:b.t)+"px";it.b=b}
  placed.push(it.b)});
 /* leader lines: anything that starts inside the ring is redrawn from the ring's edge, without the dot */
 const inR=(x,y)=>Math.hypot(x-c[0],y-c[1])<R+1;
 box.querySelectorAll("svg.ps-leaders, svg.ps-sq-lead").forEach(sv=>{[...sv.children].forEach(e=>{const t=e.tagName.toLowerCase();
   if(t==="line"&&inR(+e.getAttribute("x1"),+e.getAttribute("y1")))e.remove();else if(t==="circle"&&inR(+e.getAttribute("cx"),+e.getAttribute("cy")))e.remove();else if((t==="path"||t==="g")&&e.getBBox){try{const bb=e.getBBox();if(inR(bb.x+bb.width/2,bb.y+bb.height/2))e.remove()}catch(x){}}})});
 const lead=box.querySelector(".ps-pins svg.ps-leaders")||box.querySelector("svg.ps-sq-lead");
 if(lead){let html="";items.forEach(it=>{const b=it.b,bx=b.l+b.w/2,by=b.t+b.h/2,d=Math.hypot(bx-c[0],by-c[1]);if(d<R+4)return;
   const u=[(bx-c[0])/d,(by-c[1])/d],a=[c[0]+u[0]*(R+3),c[1]+u[1]*(R+3)],e=boxEdge(c[0],c[1],b);if(Math.hypot(e[0]-a[0],e[1]-a[1])<6)return;
   html+=`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${e[0].toFixed(1)}" y2="${e[1].toFixed(1)}" class="ps-ldr-h gf-kr-l"/><line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${e[0].toFixed(1)}" y2="${e[1].toFixed(1)}" class="ps-ldr gf-kr-l"/>`});
  lead.insertAdjacentHTML("beforeend",html)}}
{const _p=psPlacePins;psPlacePins=function(){const r=_p.apply(this,arguments);try{apply()}catch(e){console.error(e)}return r}}
{const _e=psEnd;psEnd=function(){clear();return _e.apply(this,arguments)}}
setInterval(()=>{try{if(!cur())clear()}catch(e){}},600);
{const st=document.createElement("style");st.textContent=`svg.gf-keyring{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;overflow:visible}
svg.gf-keyring circle{fill:none}svg.gf-keyring .h{stroke:rgba(10,20,40,.55);stroke-width:5}svg.gf-keyring .r{stroke:#fff;stroke-width:2.2}`;document.head.appendChild(st)}
window.gfKeyRing={RINGS,apply};
})();
