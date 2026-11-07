/* GeoFlock: a reminder that the sea level is not today's. Once someone moves the sea level (the Sea level tool or the map
   style panel) it stays set, on every map that shows it, until it is put back; this notice sits at the top of the map,
   says what the sea is set to, and puts it back to today's in one click. Not shown in tours (a tour stop sets and resets
   its own sea level). */
(function(){
let el=null;
const txt=v=>(v>0?"+":"−")+Math.abs(v)+" m";
function back(){try{const M=gfMS();M.sea=0;try{gfMSsave()}catch(e){}try{gfMsRefresh()}catch(e){}try{gfMsPanelSync()}catch(e){}try{gfGlobeDirty()}catch(e){}
 const r=document.querySelector("#gfkSea input[type=range]");if(r){r.value=0;const b=document.querySelector("#gfkSea .gfk-sealab b");if(b)b.textContent="Today"}
 try{amGlobe.request()}catch(e){}}catch(e){console.error(e)}sync()}
function sync(){try{
 let v=0;try{v=typeof gfMS==="function"?gfMS().sea||0:0}catch(e){}
 const host=typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.host;
 const show=!!v&&host&&host.isConnected&&host.offsetParent&&appMode==="allmaps"&&!(typeof ps!=="undefined"&&ps);
 if(!show){if(el)el.hidden=true;return}
 /* floats over the top of the map, never in the row of switches (joining that row made the switches jump about) */
 if(!el){el=document.createElement("div");el.className="gf-seanote gf-sn-fs";el.setAttribute("role","status")}
 if(el.parentNode!==host)host.appendChild(el);
 const k=String(v);if(el._k!==k){el._k=k;el.innerHTML='<span>🌊 Sea level is set to <b>'+txt(v)+'</b>'+(v<=-100?' (Ice Age)':v>=60?' (all ice melted)':'')+'</span><button type="button">Back to today</button>';el.querySelector("button").onclick=e=>{e.stopPropagation();back()}}
 el.hidden=false}catch(e){}}
setInterval(sync,700);
const st=document.createElement("style");st.textContent=`
.gf-seanote{ position:relative; width:fit-content; margin:0 10px 0 auto; z-index:30; display:flex; align-items:center; gap:10px;
  padding:6px 8px 6px 14px; border-radius:999px; background:rgba(14,40,80,.88); color:#eaf4ff; font:600 13px system-ui,sans-serif;
  box-shadow:0 4px 14px rgba(0,0,0,.25); white-space:nowrap; pointer-events:auto; }
.gf-seanote[hidden]{ display:none; }
.gf-seanote.gf-sn-fs{ position:absolute; top:62px; left:50%; transform:translateX(-50%); margin:0; }
.gf-seanote b{ color:#9fe0ff; }
.gf-seanote button{ border:0; border-radius:999px; padding:5px 12px; background:#2a8fd6; color:#fff; font:700 12.5px system-ui,sans-serif; cursor:pointer; }
.gf-seanote button:hover{ background:#3aa0e6; }`;document.head.appendChild(st);
window.gfSeaNote={sync,back};
})();
