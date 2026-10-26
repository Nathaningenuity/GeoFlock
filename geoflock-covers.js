/* GeoFlock: the first stop of a tour shows a spread of photos from the tour's own stops, so the map opens full of pictures
   (like the Geography and region tours). Moves up to 9 photo pins from later stops that have plenty, spread across the cover's view; nothing is shown twice. */
(function(){
if(typeof PS_TOURS==="undefined"||typeof psGo!=="function")return;
const SKIP=new Set(["projections","flags","night","timeline","geo","time","humans","islandlife","regions"]);
function inView(v,at){if(!v||v.length<4)return true;const [w,s,e,n]=v;return at[1]>=s&&at[1]<=n&&(w<=e?at[0]>=w&&at[0]<=e:at[0]>=w||at[0]<=e)}
function fill(t){try{const T=PS_TOURS[t];if(!T||SKIP.has(t)||T.projTour)return;const st=T.steps||[],S0=st[0];if(!S0||S0._cov)return;S0._cov=1;
 const have=(S0.phPins||[]).filter(q=>{try{return psSqPhoto(q)}catch(e){return false}});if(have.length>=5)return;
 const n=st.length,cand=[],seen=new Set(have.map(q=>q.label));
 for(let i=1;i<n-1;i++){const St=st[i];try{if(typeof psEnrich==="function")psEnrich(t,St,i,n)}catch(e){}
  (St.phPins||[]).forEach(q=>{if(!q||!Array.isArray(q.at)||seen.has(q.label))return;let P=null;try{P=psSqPhoto(q)}catch(e){}if(!P||!inView(S0.view,q.at))return;seen.add(q.label);cand.push({q,i,f:P.f,St})})}
 if(!cand.length)return;
 /* spread them out: always take the one farthest from those already picked, at most one photo file once */
 const v=S0.view||[-180,-58,180,80],span=Math.max(10,Math.abs(v[2]-v[0])),minD=span*.07,pick=have.map(q=>({q})),files=new Set;
 const d=(a,b)=>Math.hypot(a[0]-b[0],(a[1]-b[1])*1.3);
 while(pick.length<9){let best=null,bd=-1;cand.forEach(c=>{if(c.used||files.has(c.f))return;const m=pick.length?Math.min(...pick.map(p=>d(p.q.at,c.q.at))):1e9;const sc=m+(c.i%3)*.01;if(sc>bd){bd=sc;best=c}});
  if(!best||bd<minD)break;best.used=1;files.add(best.f);pick.push(best)}
 /* a photo moves to the first stop (it is not shown twice), and only from a stop that keeps at least two */
 const moved=pick.slice(have.length).filter(c=>{const L=c.St.phPins||[];if(L.length<3)return false;const k=L.indexOf(c.q);if(k<0)return false;L.splice(k,1);return true});
 const add=moved.map(c=>Object.assign({},c.q,{icon:"photo",todo:undefined}));
 if(!add.length)return;S0.phPins=have.concat(add);S0._sqPruned=-1}catch(e){console.error(e)}}
const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps&&i===0)fill(ps.tour)}catch(e){}return _g.apply(this,arguments)};
window.gfCoverFill=fill;
})();
