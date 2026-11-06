/* GeoFlock: the mouse wheel (and a trackpad pinch) zooms the map wherever the pointer is over the map itself: on the
   Robinson outline of the flat map or on the globe's disc, even when a label, pin, photo, search result, shape label or
   any other overlay sits under the pointer. Panels that scroll their own content (tour cards, toolkit panels, menus,
   lists) and form controls keep their wheel. Outside the outline or the disc nothing changes. */
(function(){
const G=()=>{try{return typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.canvas&&amGlobe.host&&amGlobe.host.isConnected&&amGlobe.host.offsetParent?amGlobe:null}catch(e){return null}};
const KEEP=".ps-card,.tq,.gfk-panel,.gfk-tray,.gfkl-menu,.gflib,.gflib-ask,.gf-xs,.gfth,.gfpp,.globe-btns,.gfs-list,.gfs-rows,.flag-zoom-overlay,.am-legend,.gf-legend,.flk,input,select,textarea,[contenteditable]";
/* is the point on the map itself (inside the Robinson outline, or on the globe's front half)? */
function onMap(g,x,y){const r=g.canvas.getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom)return false;
 try{const p=g.projection(),q=[x-r.left,y-r.top];if(!g._flat){const z=g.size();return Math.hypot(q[0]-z.w/2,q[1]-z.h/2)<=z.r}
  const ll=p.invert(q);if(!ll||!isFinite(ll[0])||!isFinite(ll[1])||Math.abs(ll[1])>90.01)return false;const b=p(ll);return!!b&&Math.hypot(b[0]-q[0],b[1]-q[1])<2}catch(e){return false}}
/* does an element between the target and the map scroll itself in this direction? */
function scrolls(t,stop,dy){for(let e=t;e&&e!==stop&&e!==document.body;e=e.parentElement){const cs=getComputedStyle(e);if(/(auto|scroll)/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight+1){if(dy<0?e.scrollTop>0:e.scrollTop+e.clientHeight<e.scrollHeight-1)return true}}return false}
document.addEventListener("wheel",e=>{try{if(e._gfFwd)return;const g=G();if(!g)return;const t=e.target;if(!t||t===g.canvas)return;
 if(t.closest&&t.closest(KEEP))return;if(scrolls(t,g.host,e.deltaY))return;if(!onMap(g,e.clientX,e.clientY))return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const ev=new WheelEvent("wheel",{deltaX:e.deltaX,deltaY:e.deltaY,deltaZ:e.deltaZ,deltaMode:e.deltaMode,clientX:e.clientX,clientY:e.clientY,screenX:e.screenX,screenY:e.screenY,ctrlKey:e.ctrlKey,shiftKey:e.shiftKey,altKey:e.altKey,metaKey:e.metaKey,bubbles:true,cancelable:true});
 ev._gfFwd=1;g.canvas.dispatchEvent(ev)}catch(err){}},{capture:true,passive:false});
})();
