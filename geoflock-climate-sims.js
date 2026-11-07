/* GeoFlock: five climate simulations for the Climate guided tour, in the style of geoflock-diagrams2.js.
   1. cmon     "Monsoon climates": summer and winter, land and sea, the wind turns round
   2. cmed     "Five Mediterraneans": a month slider moves the subtropical high north and south over Lisbon
   3. cmar     "London is mild for its latitude": a coastal and an inland city through the year, and the sea
   4. chadley  "The desert belts": a Hadley cell, rising air and rain at the Equator, sinking dry air near 30°
   5. ccont    "The coldest places people live": the further from the sea, the bigger the yearly swing
   Each one goes into the shared registry DG (index.html) and is mapped to its tour stop through PS_DIAG.
   Loaded after geoflock-polish-m.js. */
(function(){
"use strict";
if(typeof DG==="undefined"||typeof PS_DIAG==="undefined"||typeof dgTabs!=="function"||typeof dgFigure!=="function")return;
const INK="#1d3047",ACC="#e8701a",SUB="#5b6b80",WAT="#3d8fd1",PAN="#f3f6fa",HOT="#d2552b",COLD="#2f6ea8";
const T=(x,y,t,o)=>'<text x="'+x+'" y="'+y+'"'+(o?" "+o:"")+">"+t+"</text>";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,f1=v=>(+v).toFixed(1);
const q=(s,x)=>s.querySelector(x),txt=(s,x,t)=>{const e=q(s,x);if(e&&e.textContent!==t)e.textContent=t};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const tip=t=>' data-tip="'+esc(t)+'"';
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const deg=v=>(v<0?"−":"")+Math.abs(Math.round(v))+" °C";
const show=(svg,sel,on)=>{svg.querySelectorAll(sel).forEach(e=>{e.style.display=on?"":"none"})};
const ln=pts=>pts.map((p,i)=>(i?"L":"M")+f1(p[0])+","+f1(p[1])).join("");
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONL=["January","February","March","April","May","June","July","August","September","October","November","December"];
function simLoop(svg,fn){let last=performance.now(),vis=true;try{const io=new IntersectionObserver(es=>{vis=es[es.length-1].isIntersecting});io.observe(svg)}catch(e){}
  const tick=now=>{if(!svg.isConnected)return;const dt=Math.min(.1,(now-last)/1000);last=now;if(vis&&!document.hidden){try{fn(dt,now/1000)}catch(e){console.error(e);return}}requestAnimationFrame(tick)};requestAnimationFrame(tick)}
function slider(name,x,y,w,label){return '<g class="sm-sl cs-sl-'+name+'">'+T(x,y-6,label,'font-size="7.2" font-weight="700" fill="'+SUB+'"')+'<text class="sm-sv-'+name+'" x="'+(x+w)+'" y="'+(y-6)+'" font-size="7.6" font-weight="800" text-anchor="end" fill="'+INK+'"></text>'+
  '<rect x="'+x+'" y="'+(y-2)+'" width="'+w+'" height="4" rx="2" fill="#d6dee8"/><rect class="sm-fill-'+name+'" x="'+x+'" y="'+(y-2)+'" width="0" height="4" rx="2" fill="'+ACC+'"/>'+
  '<rect x="'+(x-6)+'" y="'+(y-9)+'" width="'+(w+12)+'" height="18" fill="transparent" data-drag="'+name+'"/>'+
  '<g class="dg-handle sm-knob-'+name+'" data-drag="'+name+'"><circle r="11" fill="transparent"/><circle r="5.6" fill="#fff" stroke="'+ACC+'" stroke-width="2"/></g></g>'}
function setSlider(svg,name,x,y,w,f,v){f=clamp(f,0,1);const k=q(svg,".sm-knob-"+name);if(k)k.setAttribute("transform","translate("+f1(x+w*f)+","+y+")");const fl=q(svg,".sm-fill-"+name);if(fl)fl.setAttribute("width",f1(w*f));txt(svg,".sm-sv-"+name,v)}
/* month ticks under a month slider */
function monthTicks(x,y,w){let s="";for(let i=0;i<12;i++)s+=T(f1(x+w*i/11),y+11,MON[i][0],'font-size="5.4" text-anchor="middle" fill="'+SUB+'" opacity=".75"');return s}
function btn(act,x,y,w,label){return '<g data-act="'+act+'" class="sm-btn cs-btn-'+act+'" style="cursor:pointer"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="15" rx="7.5" fill="'+INK+'"/><text class="sm-btn-t" x="'+(x+w/2)+'" y="'+(y+10.4)+'" font-size="7.2" font-weight="800" text-anchor="middle" fill="#fff">'+label+'</text></g>'}
function btnOn(svg,act,on,label){const r=q(svg,".cs-btn-"+act+" rect");if(r)r.style.fill=on?ACC:INK;if(label)txt(svg,".cs-btn-"+act+" text",label)}
function tabSel(svg,i){svg.querySelectorAll(".dg-tab").forEach((t,j)=>{const on=j===i;t.classList.toggle("on",on);const r=t.querySelector("rect"),x=t.querySelector("text");if(r)r.style.fill=on?INK:"#fff";if(x)x.setAttribute("fill",on?"#fff":INK)})}
function tabIdx(a,cur,n){if(a==="tabnext")return(cur+1)%n;const m=/^tab:(\d+)/.exec(a);return m?+m[1]:null}
function para(cls,x,y,w,h,size,col){return '<foreignObject x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"><div xmlns="http://www.w3.org/1999/xhtml" class="'+cls+'" style="font:500 '+size+'px/1.32 Inter,system-ui,sans-serif;color:'+(col||SUB)+'"></div></foreignObject>'}
const setPara=(svg,cls,t)=>{const d=q(svg,"."+cls);if(d&&d.innerHTML!==t)d.innerHTML=t};
function panel(x,y,w,h,cls,rows){let s='<g transform="translate('+x+','+y+')"><rect width="'+w+'" height="'+h+'" rx="9" fill="'+PAN+'"/><text class="'+cls+'-nm" x="7" y="13" font-size="8.4" font-weight="900" fill="'+INK+'"></text>';
  rows.forEach(r=>{const yy=r[2];s+=T(7,yy,r[0],'class="'+cls+'-L'+r[1]+'" font-size="5.7" fill="'+SUB+'"')+'<text class="'+cls+'-'+r[1]+'" x="7" y="'+(yy+7.6)+'" font-size="6.5" font-weight="800" fill="'+INK+'"></text>'});return s+'</g>'}
const add=(k,cat)=>{DG[k].cat=cat;try{if(!SIM_KEYS.includes(k))SIM_KEYS.push(k);if(!DG_ORDER.includes(k))DG_ORDER.push(k)}catch(e){}};
/* an arrow from (x1,y1) to (x2,y2) */
function arrow(x1,y1,x2,y2,col,w,o){const a=Math.atan2(y2-y1,x2-x1),h=5+w,p=(d,s)=>[x2-h*Math.cos(a)+s*h*.55*Math.sin(a),y2-h*Math.sin(a)-s*h*.55*Math.cos(a)];const A=p(0,1),B=p(0,-1);
  return '<g'+(o||"")+'><line x1="'+f1(x1)+'" y1="'+f1(y1)+'" x2="'+f1(x2-(h-1)*Math.cos(a))+'" y2="'+f1(y2-(h-1)*Math.sin(a))+'" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round"/><path d="M'+f1(A[0])+','+f1(A[1])+' L'+f1(x2)+','+f1(y2)+' L'+f1(B[0])+','+f1(B[1])+'Z" fill="'+col+'"/></g>'}
const cloud=(x,y,s,col)=>'<g transform="translate('+f1(x)+','+f1(y)+') scale('+s+')"><ellipse cx="0" cy="0" rx="13" ry="6.5" fill="'+(col||"#f4f7fa")+'" stroke="#a9b8c8" stroke-width=".6"/><circle cx="-4" cy="-4" r="6" fill="'+(col||"#f4f7fa")+'"/><circle cx="4" cy="-5" r="7" fill="'+(col||"#f4f7fa")+'"/><ellipse cx="0" cy="1" rx="12.4" ry="5" fill="'+(col||"#f4f7fa")+'"/></g>';
const sun=(x,y,r)=>{let s='<g transform="translate('+f1(x)+','+f1(y)+')">';for(let i=0;i<8;i++){const a=i*Math.PI/4;s+='<line x1="'+f1(Math.cos(a)*(r+2))+'" y1="'+f1(Math.sin(a)*(r+2))+'" x2="'+f1(Math.cos(a)*(r+5))+'" y2="'+f1(Math.sin(a)*(r+5))+'" stroke="#f0a500" stroke-width="1.2" stroke-linecap="round"/>'}return s+'<circle r="'+r+'" fill="#ffd34d" stroke="#f0a500" stroke-width=".8"/></g>'};
const press=(x,y,L,col,o)=>'<g'+(o||"")+'><circle cx="'+x+'" cy="'+y+'" r="8.5" fill="#fff" stroke="'+col+'" stroke-width="1.4"/>'+T(x,y+3.6,L,'font-size="10" font-weight="900" text-anchor="middle" fill="'+col+'"')+'</g>';
/* one diagram: o.tabs (optional), o.h (height), o.frame(tab) the fixed parts, o.draw(svg,s), o.tick, o.drag, o.act */
function make(key,o){const nT=o.tabs?o.tabs.length:1,t0=a=>clamp(parseInt(a,10)||0,0,nT-1);
  DG[key]={title:o.title,src:o.src,
   svg:a=>'<svg viewBox="0 0 300 '+o.h+'">'+(o.tabs?dgTabs(o.tabs,t0(a),4,8):"")+o.frame(t0(a))+'</svg>',
   _d:(svg,s)=>o.draw(svg,s,false),
   init:(svg,a)=>{svg._s=Object.assign({tab:t0(a)},o.state?o.state(t0(a),a):{});o.draw(svg,svg._s,true);if(o.tick)simLoop(svg,dt=>o.tick(svg,svg._s,dt))},
   drag:(svg,n,x,y)=>{const s=svg._s;if(s&&o.drag){o.drag(svg,s,n,x,y);o.draw(svg,s,false)}},
   act:(svg,a)=>{const s=svg._s;if(!s)return false;if(o.tabs){const i=tabIdx(a,s.tab,nT);if(i!=null){s.tab=i;tabSel(svg,i);if(o.onTab)o.onTab(svg,s);o.draw(svg,s,true);return true}}
     if(o.act&&o.act(svg,s,a)){o.draw(svg,s,true);return true}return false}}}

/* ================================================================ 1. Monsoon: summer and winter */
(function(){
/* Delhi air temperature and Arabian Sea surface temperature (as in DG.monsoon); Mumbai rain, mm per month */
const RAIN=[0,0,0,0,15,500,850,550,320,80,15,5];
const S=[{land:33,landW:"Delhi, June",sea:29,wind:"From the sea: damp",press:"Low over the land",rain:"About 2,200 mm",rainW:"Jun–Sep",mon:[5,6,7,8],
  p:"<b>Summer.</b> Land heats up faster than the sea. Hot air rises over India, leaving low pressure, and damp air is pulled in from the ocean. As it climbs the hills and the Himalayas it cools and pours with rain."},
 {land:14,landW:"Delhi, January",sea:26,wind:"From the land: dry",press:"High over the land",rain:"About 5 mm",rainW:"Dec–Feb",mon:[11,0,1],
  p:"<b>Winter.</b> Now land cools faster than the sea. Cold, heavy air sinks over Asia, leaving high pressure, and flows out to sea. The wind has turned round: months of dry, sunny weather."}];
/* winds: summer from the south-west, winter from the north-east */
const WS=[[20,166,70,104],[58,170,92,126],[128,168,150,112],[146,118,164,80]],WW=[[176,62,138,112],[86,62,30,110],[150,96,176,150],[66,92,30,140]];
const LAND="M6,26 H196 V74 L176,76 L160,86 L140,98 L122,128 L104,154 L94,134 L84,108 L74,90 L60,80 L6,76 Z";
make("cmon",{title:"Why the monsoon wind turns round",
 src:"Approximate long-term averages, rounded: New Delhi air temperature and Mumbai rainfall (India Meteorological Department normals); Arabian Sea surface temperature (NOAA). The map is a sketch.",
 tabs:["Summer: June to September","Winter: December to February"],h:208,
 state:()=>({t:0}),
 frame:()=>{let h='<defs><clipPath id="dgCmClip"><rect x="6" y="26" width="190" height="146" rx="8"/></clipPath></defs><g clip-path="url(#dgCmClip)"><rect x="6" y="26" width="190" height="146" fill="#5b9ed8"/>';
  h+='<path class="cm-land" d="'+LAND+'" fill="#e3b77e" stroke="#b98d55" stroke-width=".8"/>';
  h+='<path d="M50,52 L66,40 L78,48 L92,36 L106,46 L120,34 L136,46 L150,38 L170,50 L186,44 L196,50 L196,58 L50,60 Z" fill="#a08566"/><path d="M66,40 L70,44 L74,46 L78,48 M92,36 L97,41 L101,43 M120,34 L126,40 L130,42 M150,38 L156,42" stroke="#fff" stroke-width="1.6" fill="none"/>';
  h+='<g class="cm-a"></g><g class="cm-fx"></g></g>';
  h+=T(100,32,"Himalayas",'font-size="6.4" font-weight="800" text-anchor="middle" fill="#fff"')+T(108,104,"INDIA",'font-size="7.6" font-weight="900" text-anchor="middle" fill="#6b4a22" letter-spacing=".6"')+T(34,128,"Arabian",'font-size="6.2" font-weight="700" text-anchor="middle" fill="#fff"')+T(34,135,"Sea",'font-size="6.2" font-weight="700" text-anchor="middle" fill="#fff"')+T(170,134,"Bay of",'font-size="6.2" font-weight="700" text-anchor="middle" fill="#fff"')+T(170,141,"Bengal",'font-size="6.2" font-weight="700" text-anchor="middle" fill="#fff"');
  h+='<circle cx="76" cy="104" r="2.2" fill="'+INK+'"/>'+T(80,111,"Mumbai",'font-size="5.8" font-weight="800" fill="'+INK+'"')+'<circle cx="104" cy="70" r="2.2" fill="'+INK+'"/>'+T(108,72,"Delhi",'font-size="5.8" font-weight="800" fill="'+INK+'"');
  h+='<g class="cm-b"></g>';
  h+=panel(202,26,94,146,"cm",[["Land","ld",22],["Sea","se",40],["Air pressure","pr",58],["Wind","wd",76],["Rain","rn",94]]);
  h+='<g class="cm-bars" transform="translate(209,163)"></g>';
  h+=para("cm-p",8,175,288,32,6.3);return h},
 draw:(svg,s)=>{const D=S[s.tab],sum=s.tab===0;let a="",b="";
  const L=q(svg,".cm-land");if(L)L.style.fill=sum?"#e9a86a":"#cfd6c2";
  if(sum){a+=press(134,88,"L",HOT,tip("Low pressure: hot air rising over the land"))+press(100,162,"H",COLD,tip("Higher pressure over the cooler ocean"));
   WS.forEach(w=>a+=arrow(w[0],w[1],w[2],w[3],"#0e4f8f",2.2));
   [[80,90,.8],[96,82,.7],[150,70,.85],[166,76,.7],[124,64,.7]].forEach(c=>a+=cloud(c[0],c[1],c[2],"#eef2f6"));
   b+=T(10,40,"land: "+D.land+" °C",'font-size="6.6" font-weight="900" fill="'+HOT+'" stroke="#fff" stroke-width="2" paint-order="stroke"')+T(10,168,"sea: "+D.sea+" °C",'font-size="6.6" font-weight="900" fill="#fff"');}
  else{a+=press(136,64,"H",COLD,tip("High pressure: cold, heavy air sinking over the land"))+press(110,162,"L",HOT,tip("Lower pressure over the warmer ocean"));
   WW.forEach(w=>a+=arrow(w[0],w[1],w[2],w[3],"#7d8a99",2.2));
   a+=sun(104,126,5.5);
   b+=T(10,40,"land: "+D.land+" °C",'font-size="6.6" font-weight="900" fill="'+COLD+'" stroke="#fff" stroke-width="2" paint-order="stroke"')+T(10,168,"sea: "+D.sea+" °C",'font-size="6.6" font-weight="900" fill="#fff"');}
  const A=q(svg,".cm-a");if(A)A.innerHTML=a;const B=q(svg,".cm-b");if(B)B.innerHTML=b;
  txt(svg,".cm-nm",sum?"Summer":"Winter");txt(svg,".cm-ld",D.land+" °C ("+D.landW+")");txt(svg,".cm-se",D.sea+" °C (Arabian Sea)");txt(svg,".cm-pr",D.press);txt(svg,".cm-wd",D.wind);txt(svg,".cm-rn",D.rain);
  const lw=q(svg,".cm-Lwd");if(lw)lw.textContent=sum?"Wind from the south-west":"Wind from the north-east";
  const lr=q(svg,".cm-Lrn");if(lr)lr.textContent="Rain in Mumbai, "+D.rainW;
  const ld=q(svg,".cm-ld");if(ld)ld.style.fill=sum?HOT:COLD;
  let g=T(0,-19,"Mumbai rain, month by month",'font-size="5.2" fill="'+SUB+'"');RAIN.forEach((r,i)=>{const hh=Math.max(.6,r/850*15),on=D.mon.includes(i);g+='<rect x="'+f1(i*6.6)+'" y="'+f1(-hh)+'" width="5" height="'+f1(hh)+'" fill="'+(on?WAT:"#c9d3de")+'"'+tip(MONL[i]+": about "+r+" mm")+'/>'+T(f1(i*6.6+2.5),6.4,MON[i][0],'font-size="4.4" text-anchor="middle" fill="'+(on?INK:SUB)+'"')});
  const G=q(svg,".cm-bars");if(G)G.innerHTML=g;
  setPara(svg,"cm-p",D.p)},
 tick:(svg,s,dt)=>{const fx=q(svg,".cm-fx");if(!fx)return;s.t+=dt;const sum=s.tab===0,W=sum?WS:WW;let h="";
  W.forEach((w,j)=>{for(let i=0;i<3;i++){const u=((s.t*.45)+i/3+j*.21)%1;h+='<circle cx="'+f1(lerp(w[0],w[2],u))+'" cy="'+f1(lerp(w[1],w[3],u))+'" r="'+(sum?1.7:1.3)+'" fill="'+(sum?"#bfe3ff":"#e2d3b8")+'" opacity="'+f1(Math.sin(u*Math.PI))+'"/>'}});
  if(sum){[[80,90],[96,82],[150,70],[166,76],[124,64]].forEach((c,j)=>{for(let i=0;i<4;i++){const x=c[0]-8+rnd(i+j*7)*16,y=c[1]+5+((s.t*40+rnd(i+j*7+3)*18)%18);h+='<path d="M'+f1(x)+','+f1(y)+' l-1,3.6" stroke="#2a6db3" stroke-width="1"/>'}})}
  fx.innerHTML=h}});
add("cmon","climate");
})();

/* ================================================================ 2. Mediterranean: the high moves north and south */
(function(){
/* Lisbon, mm per month (IPMA normals 1971–2000, rounded) */
const RAIN=[110,110,60,65,50,15,5,5,35,100,110,125];
const Y0=168,Y1=10,LA0=20,LA1=56,Y=lat=>Y0-(lat-LA0)*(Y0-Y1)/(LA1-LA0);
const LIS=[92,38.7];
const latH=m=>34.5+4.5*Math.cos(2*Math.PI*(m-6.5)/12);
make("cmed",{title:"Dry summers, wet winters",
 src:"Lisbon monthly rainfall (IPMA normals 1971–2000, rounded). The centre of the Azores High lies near 30–33°N in winter and 37–40°N in summer (approximate). The map is a sketch.",
 h:220,state:()=>({m:6,t:0}),
 frame:()=>{let h='<defs><clipPath id="dgCdClip"><rect x="6" y="8" width="190" height="164" rx="8"/></clipPath></defs><g clip-path="url(#dgCdClip)"><rect x="6" y="8" width="190" height="164" fill="#5b9ed8"/>';
  /* Europe, Iberia, North Africa, roughly */
  h+='<path d="M196,8 L120,8 L112,'+f1(Y(51))+' L118,'+f1(Y(48))+' L102,'+f1(Y(47))+' L104,'+f1(Y(44))+' L86,'+f1(Y(43.4))+' L84,'+f1(Y(41))+' L88,'+f1(Y(38.6))+' L86,'+f1(Y(37))+' L102,'+f1(Y(36.2))+' L122,'+f1(Y(37.4))+' L134,'+f1(Y(40.5))+' L150,'+f1(Y(42.5))+' L170,'+f1(Y(43.6))+' L182,'+f1(Y(41))+' L196,'+f1(Y(40))+' Z" fill="#bfcf9c" stroke="#8fa070" stroke-width=".7"/>';
  h+='<path d="M196,'+f1(Y(37.2))+' L170,'+f1(Y(36.9))+' L140,'+f1(Y(35.8))+' L108,'+f1(Y(35.6))+' L96,'+f1(Y(33.5))+' L78,'+f1(Y(30))+' L66,'+f1(Y(25))+' L60,'+f1(Y(20))+' L196,'+f1(Y(20))+' Z" fill="#e2c48c" stroke="#b99a62" stroke-width=".7"/>';
  h+='<path d="M64,'+f1(Y(53.5))+' L78,'+f1(Y(55.5))+' L92,'+f1(Y(53))+' L88,'+f1(Y(50.5))+' L72,'+f1(Y(51.2))+' Z" fill="#bfcf9c" stroke="#8fa070" stroke-width=".7"/>';
  h+=T(34,f1(Y(23.5)),"Atlantic",'font-size="6.4" font-weight="700" fill="#fff" text-anchor="middle"')+T(150,f1(Y(38.6)),"Mediterranean",'font-size="5.6" font-weight="700" fill="#fff" text-anchor="middle"')+T(150,f1(Y(26)),"Sahara",'font-size="6.6" font-weight="800" fill="#8b6a32" text-anchor="middle"')+T(160,f1(Y(50)),"Europe",'font-size="6.6" font-weight="800" fill="#56683a" text-anchor="middle"');
  for(let la=30;la<=50;la+=10)h+='<path d="M6,'+f1(Y(la))+' H196" stroke="#fff" stroke-width=".4" stroke-dasharray="2 3" opacity=".7"/>'+T(9,f1(Y(la)-2),la+"°N",'font-size="5.2" fill="#fff" opacity=".9"');
  h+='<g class="cd-a"></g><g class="cd-fx"></g>';
  h+='<circle cx="'+LIS[0]+'" cy="'+f1(Y(LIS[1]))+'" r="2.6" fill="'+INK+'" stroke="#fff" stroke-width=".8"/>'+T(LIS[0]+4,f1(Y(LIS[1])+2),"Lisbon",'font-size="6" font-weight="900" fill="'+INK+'" stroke="#fff" stroke-width="2" paint-order="stroke"')+'</g>';
  h+=panel(202,8,94,164,"cd",[["Over Lisbon now","ov",26],["Rain this month","rn",46],["Weather","wx",66]]);
  h+='<g class="cd-bars" transform="translate(208,160)"></g>';
  h+=para("cd-p",8,174,288,22,6.2)+slider("m",14,204,272,"Month")+monthTicks(14,204,272);return h},
 draw:(svg,s)=>{const m=s.m,mi=Math.round(m)%12,lh=latH(m),R=RAIN[mi],wet=R>=40;let a="";
  const yH=Y(lh),yS=Y(lh+10);
  a+='<ellipse cx="62" cy="'+f1(yH)+'" rx="56" ry="24" fill="#ffd79a" opacity=".85" stroke="#e8701a" stroke-width="1" stroke-dasharray="3 2"'+tip("The subtropical (Azores) high: air sinks and warms, so clouds cannot form")+'/>';
  a+=T(62,f1(yH+4),"H",'font-size="15" font-weight="900" text-anchor="middle" fill="#c2561a"')+T(62,f1(yH+13),"high: sinking, dry air",'font-size="5.6" font-weight="800" text-anchor="middle" fill="#8a3d10"');
  [[40,yS,.95],[66,yS-6,.8],[86,yS+3,.7]].forEach(c=>a+=cloud(c[0],c[1],c[2],"#e8edf2"));
  a+=T(18,f1(yS-12),"L",'font-size="11" font-weight="900" fill="#3d4f66"')+T(24,f1(yS-12),"storms from the Atlantic",'font-size="5.4" font-weight="800" fill="#fff" stroke="#3d4f66" stroke-width="1.6" paint-order="stroke"');
  a+=arrow(12,yS-24,38,yS-24,"#fff",1.6)+T(42,f1(yS-22),"west winds",'font-size="5" font-weight="800" fill="#fff" stroke="#3d4f66" stroke-width="1.4" paint-order="stroke"');
  if(!wet)a+=sun(LIS[0]+12,Y(LIS[1])-12,4.5);
  const A=q(svg,".cd-a");if(A)A.innerHTML=a;
  s.rainY=[yS+6,Y0];
  txt(svg,".cd-nm",MONL[mi]);txt(svg,".cd-ov",R<20?"The high":R<70?"Some storms":"Storm after storm");
  txt(svg,".cd-rn","About "+R+" mm");txt(svg,".cd-wx",R<20?"Hot, dry and sunny":R<70?"Showers and sun":"Wet and mild");
  const rv=q(svg,".cd-rn");if(rv)rv.style.fill=wet?COLD:HOT;
  let g=T(0,-50,"Lisbon rain, month by month",'font-size="5.2" fill="'+SUB+'"');RAIN.forEach((r,i)=>{const hh=Math.max(.6,r/125*40),on=i===mi;g+='<rect x="'+f1(i*6.7)+'" y="'+f1(-hh)+'" width="5.2" height="'+f1(hh)+'" rx="1" fill="'+(on?ACC:r>=40?"#8fb8de":"#d9c49a")+'"'+tip(MONL[i]+": about "+r+" mm")+'/>'+T(f1(i*6.7+2.6),7,MON[i][0],'font-size="4.4" text-anchor="middle" fill="'+(on?INK:SUB)+'" font-weight="'+(on?800:500)+'"')});
  const G=q(svg,".cd-bars");if(G)G.innerHTML=g;
  setPara(svg,"cd-p",R>=70?"<b>Winter half.</b> The high has moved south, so storms riding the west winds reach Lisbon and bring most of its rain.":
   R>=20?"<b>Spring and autumn.</b> The high is on its way north or south. Some storms still get through, between sunny spells.":"<b>Summer half.</b> The high has moved north over Lisbon. Its sinking air blocks the storms, so it hardly rains for months. California, central Chile, the Cape and south-west Australia work the same way.");
  setSlider(svg,"m",14,204,272,m/11,MONL[mi])},
 drag:(svg,s,n,x)=>{s.m=clamp((x-14)/272,0,1)*11},
 tick:(svg,s,dt)=>{const fx=q(svg,".cd-fx");if(!fx)return;s.t+=dt;const R=RAIN[Math.round(s.m)%12],yS=Y(latH(s.m)+10);let h="";
  const n=Math.round(4+R/8);for(let i=0;i<n;i++){const x=40+rnd(i)*60,y=yS+6+((s.t*44+rnd(i+30)*40)%Math.max(10,Math.min(54,Y(LIS[1])-yS+8)));h+='<path d="M'+f1(x)+','+f1(y)+' l-1,3.6" stroke="#1d5f99" stroke-width="1"/>'}
  fx.innerHTML=h}});
add("cmed","climate");
})();

/* ================================================================ 3. By the sea or far inland: London and Winnipeg */
(function(){
const LON=[5,5,8,10,13,16,19,19,16,12,8,6],WIN=[-16,-13,-6,4,12,17,20,19,13,5,-5,-13],SEA=[10,9,9,10,12,14,16,17,16,14,12,11];
const X0=32,X1=192,YT=30,YB=160,TMIN=-20,TMAX=25,X=m=>X0+(X1-X0)*m/11,Yt=t=>YB-(t-TMIN)*(YB-YT)/(TMAX-TMIN);
const at=(A,m)=>{const i=Math.floor(m),f=m-i;return lerp(A[i],A[Math.min(11,i+1)],f)};
const path=A=>ln(A.map((v,i)=>[X(i),Yt(v)]));
make("cmar",{title:"By the sea or far inland",
 src:"Monthly mean temperatures, 1981–2010, rounded: London Heathrow (Met Office) and Winnipeg (Environment and Climate Change Canada). Sea surface off Plymouth, south-west England (Western Channel Observatory), approximate.",
 h:220,state:()=>({m:0,sea:true}),
 frame:()=>{let h='<rect x="'+X0+'" y="'+YT+'" width="'+(X1-X0)+'" height="'+(YB-YT)+'" fill="#f7f9fc" stroke="#dde4ec"/>';
  for(let t=-20;t<=25;t+=10){h+='<path d="M'+X0+','+f1(Yt(t))+' H'+X1+'" stroke="'+(t===0?"#9aa8b8":"#e3e9f0")+'" stroke-width="'+(t===0?.8:.5)+'"/>'+T(X0-3,f1(Yt(t)+2),(t<0?"−":"")+Math.abs(t)+"°",'font-size="5.6" text-anchor="end" fill="'+SUB+'"')}
  h+=T(X0-3,f1(Yt(25)+2),"25°",'font-size="5.6" text-anchor="end" fill="'+SUB+'"');
  for(let i=0;i<12;i++)h+=T(f1(X(i)),YB+8,MON[i][0],'font-size="5.4" text-anchor="middle" fill="'+SUB+'"');
  h+=T(X0,YT-5,"average temperature each month, °C",'font-size="5.8" font-weight="700" fill="'+SUB+'"');
  h+='<g class="cr-sea"><path d="'+path(SEA)+'" fill="none" stroke="'+WAT+'" stroke-width="1.4" stroke-dasharray="3 2"/>'+T(f1(X(11)+2),f1(Yt(SEA[11])+2),"sea",'font-size="5.6" font-weight="800" fill="'+WAT+'"')+'</g>';
  h+='<path d="'+path(WIN)+'" fill="none" stroke="#6a4fb8" stroke-width="2"/><path d="'+path(LON)+'" fill="none" stroke="'+ACC+'" stroke-width="2"/>';
  h+=T(f1(X(1.2)),f1(Yt(LON[1])+10),"London: by the sea",'font-size="6" font-weight="900" fill="'+ACC+'"')+T(f1(X(1.4)),f1(Yt(WIN[1])+12),"Winnipeg: far inland",'font-size="6" font-weight="900" fill="#6a4fb8"');
  h+='<g class="cr-cur"></g>';
  h+=panel(202,26,94,146,"cr",[["London, 51°N","lo",26],["Winnipeg, 50°N","wi",46],["The sea nearby","se",66]]);
  h+='<g transform="translate(202,26)">'+T(7,96,"Swing over the year",'font-size="5.7" fill="'+SUB+'"')+T(7,110,"London 14 °C",'font-size="6.2" font-weight="800" fill="'+ACC+'"')+'<rect x="7" y="113" width="'+f1(14*2.2)+'" height="4" rx="2" fill="'+ACC+'"/>'+T(7,128,"Winnipeg 36 °C",'font-size="6.2" font-weight="800" fill="#6a4fb8"')+'<rect x="7" y="131" width="'+f1(36*2.2)+'" height="4" rx="2" fill="#6a4fb8"/></g>';
  h+=btn("sea",198,6,98,"Hide the sea");
  h+=para("cr-p",8,174,288,22,6.2)+slider("m",X0,204,X1-X0,"Month")+monthTicks(X0,204,X1-X0);return h},
 draw:(svg,s)=>{const m=s.m,mi=Math.round(m),l=at(LON,m),w=at(WIN,m),se=at(SEA,m);
  show(svg,".cr-sea",s.sea);btnOn(svg,"sea",s.sea,s.sea?"Hide the sea":"Show the sea");
  let c='<path d="M'+f1(X(m))+','+YT+' V'+YB+'" stroke="'+INK+'" stroke-width=".7" stroke-dasharray="2 2"/>';
  c+='<circle cx="'+f1(X(m))+'" cy="'+f1(Yt(l))+'" r="3.2" fill="'+ACC+'" stroke="#fff"/><circle cx="'+f1(X(m))+'" cy="'+f1(Yt(w))+'" r="3.2" fill="#6a4fb8" stroke="#fff"/>';
  if(s.sea)c+='<circle cx="'+f1(X(m))+'" cy="'+f1(Yt(se))+'" r="2.6" fill="'+WAT+'" stroke="#fff"/>';
  const G=q(svg,".cr-cur");if(G)G.innerHTML=c;
  txt(svg,".cr-nm",MONL[mi]);txt(svg,".cr-lo",deg(l));txt(svg,".cr-wi",deg(w));txt(svg,".cr-se",s.sea?deg(se)+" (off Plymouth)":"hidden");
  const win=mi<=2||mi>=10,summ=mi>=5&&mi<=8;
  setPara(svg,"cr-p",win?"<b>Winter.</b> The sea cools slowly and is still about 10 °C. West winds blow off it, over water warmed by the North Atlantic Drift (the end of the Gulf Stream), so London stays mild. Inland Winnipeg: "+deg(w)+".":
   summ?"<b>Summer.</b> Land heats up fast and the sea slowly, so far inland gets just as warm as London. The cool sea keeps London’s summer mild.":
   "<b>Spring and autumn.</b> Inland, temperatures shoot up and drop fast. By the sea they change slowly: the water stores summer heat and gives it back in winter.");
  setSlider(svg,"m",X0,204,X1-X0,m/11,MONL[mi])},
 drag:(svg,s,n,x)=>{s.m=clamp((x-X0)/(X1-X0),0,1)*11},
 act:(svg,s,a)=>{if(a==="sea"){s.sea=!s.sea;return true}return false}});
add("cmar","climate");
})();

/* ================================================================ 4. The Hadley cell */
(function(){
const GY=148,TOP=40,X=lat=>101+lat*2.2;
const Z=[{a:0,b:8,nm:"Rising air",wx:"Hot and wet all year",N:["Singapore (1°N)","about 2,500 mm"],S:["Manaus, Brazil (3°S)","about 2,300 mm"],
   p:"<b>Near the Equator</b> the Sun heats the ground most. Warm, damp air rises, cools and forms towering clouds, so it rains nearly every afternoon."},
 {a:8,b:18,nm:"Rising air, but only in summer",wx:"A wet season and a dry season",N:["Kano, Nigeria (12°N)","about 900 mm"],S:["Lusaka, Zambia (15°S)","about 800 mm"],
   p:"<b>Between the belts</b> the rain belt follows the Sun north and south through the year, so these places get a wet summer and a dry winter."},
 {a:18,b:33,nm:"Sinking air",wx:"Dry: hot deserts",N:["Aswan, Egypt (24°N)","about 1 mm"],S:["Alice Springs, Australia (24°S)","about 280 mm"],
   p:"<b>Near 30°</b> the air that rose at the Equator, now dried out, sinks again. Sinking air warms up, so clouds cannot form: the Sahara, Arabia and the Australian outback."},
 {a:33,b:41,nm:"West winds and storms",wx:"Rain from passing storms",N:["Lisbon, Portugal (39°N)","about 800 mm"],S:["Cape Town, South Africa (34°S)","about 500 mm"],
   p:"<b>Beyond the deserts</b> the west winds bring storms, at least in winter, and rain returns."}];
const zone=lat=>{const a=Math.abs(lat);return Z.find(z=>a<z.b)||Z[3]};
/* the loop of one cell: up at the Equator, out high up, down near 30°, back along the ground */
const loop=(d,u)=>{const x0=X(d*3),x1=X(d*29),yT=TOP,yB=GY-8,P=2*(Math.abs(x1-x0)+(yB-yT)),L=(yB-yT),W=Math.abs(x1-x0);let s=u*P;
  if(s<L)return[x0,yB-s];s-=L;if(s<W)return[x0+d*s,yT];s-=W;if(s<L)return[x1,yT+s];s-=L;return[x1-d*s,yB]};
make("chadley",{title:"Why the deserts lie near 30°",
 src:"The Hadley cells, simplified. Yearly rainfall, rounded long-term averages from national weather services. Heights not to scale: the cells reach about 15 km up.",
 h:214,state:()=>({lat:24,t:0}),
 frame:()=>{let h='<defs><linearGradient id="dgChSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc7ea"/><stop offset="1" stop-color="#e6f2fb"/></linearGradient><clipPath id="dgChClip"><rect x="6" y="8" width="190" height="164" rx="8"/></clipPath></defs><g clip-path="url(#dgChClip)"><rect x="6" y="8" width="190" height="164" fill="url(#dgChSky)"/>';
  /* ground coloured by belt */
  for(let la=-42;la<42;la+=2){const z=zone(la+1),c=z===Z[0]?"#4f9a4a":z===Z[1]?"#9cbc5a":z===Z[2]?"#e2c48c":"#8fb07a";h+='<rect x="'+f1(X(la))+'" y="'+GY+'" width="'+f1(2.2*2+.4)+'" height="24" fill="'+c+'"/>'}
  [[-30,"30°S"],[0,"Equator"],[30,"30°N"]].forEach(([la,t])=>h+='<path d="M'+f1(X(la))+','+(GY)+' v6" stroke="'+INK+'" stroke-width=".7"/>'+T(f1(X(la)),GY+14,t,'font-size="6" font-weight="800" text-anchor="middle" fill="'+INK+'"'));
  [-1,1].forEach(d=>{const x0=X(d*3),x1=X(d*29);h+='<rect x="'+f1(Math.min(x0,x1))+'" y="'+TOP+'" width="'+f1(Math.abs(x1-x0))+'" height="'+(GY-8-TOP)+'" rx="14" fill="none" stroke="#fff" stroke-width="5" opacity=".55"/>';
   h+=arrow(x0,GY-20,x0,TOP+18,"#c0561d",1.6)+arrow(x0+d*16,TOP,x1-d*16,TOP,"#7d8a99",1.6)+arrow(x1,TOP+18,x1,GY-24,"#c98a00",1.6)+arrow(x1-d*14,GY-8,x0+d*14,GY-8,"#2f6ea8",1.6)});
  h+=cloud(X(0),TOP+4,1.1)+cloud(X(-4),TOP+22,.8)+cloud(X(4),TOP+24,.8);
  h+=sun(X(-29),24,5)+sun(X(29),24,5);
  h+=T(X(0),20,"air rises: rain",'font-size="6" font-weight="900" text-anchor="middle" fill="#c0561d"');
  h+=T(X(22),GY-30,"air sinks:",'font-size="5.8" font-weight="900" text-anchor="middle" fill="#9a6a00"')+T(X(22),GY-23,"dry",'font-size="5.8" font-weight="900" text-anchor="middle" fill="#9a6a00"');
  h+=T(X(-22),GY-30,"air sinks:",'font-size="5.8" font-weight="900" text-anchor="middle" fill="#9a6a00"')+T(X(-22),GY-23,"dry",'font-size="5.8" font-weight="900" text-anchor="middle" fill="#9a6a00"');
  h+=T(X(16),GY-12,"trade winds",'font-size="5.4" font-weight="800" text-anchor="middle" fill="#2f6ea8"')+T(X(-16),GY-12,"trade winds",'font-size="5.4" font-weight="800" text-anchor="middle" fill="#2f6ea8"');
  h+=T(X(16),TOP-3,"high up, air flows away",'font-size="5.2" font-weight="700" text-anchor="middle" fill="'+SUB+'"');
  h+='<g class="ch-fx"></g><g class="ch-pin"></g></g>';
  h+=panel(202,8,94,164,"ch",[["The air here","ai",26],["Weather","wx",46],["For example","ex",66],["Rain in a year","rn",86]]);
  h+=para("ch-p",8,174,288,22,6.2)+slider("lat",X(-40),204,X(40)-X(-40),"Where are you? Drag north or south");return h},
 draw:(svg,s)=>{const la=s.lat,z=zone(la),N=la>=0?z.N:z.S,ns=Math.abs(Math.round(la))+"°"+(Math.round(la)>0?"N":Math.round(la)<0?"S":"");
  const P=q(svg,".ch-pin");if(P)P.innerHTML='<path d="M'+f1(X(la))+','+(GY-1)+' l-4,-9 a4.5,4.5 0 1 1 8,0 z" fill="'+ACC+'" stroke="#fff" stroke-width=".8"/><circle cx="'+f1(X(la))+'" cy="'+(GY-13)+'" r="1.6" fill="#fff"/>';
  txt(svg,".ch-nm","Latitude "+(Math.round(la)===0?"0°":ns));txt(svg,".ch-ai",z.nm);txt(svg,".ch-wx",z.wx);
  const ex=q(svg,".ch-ex");if(ex)ex.textContent=N[0];txt(svg,".ch-rn",N[1]);
  const rv=q(svg,".ch-rn");if(rv)rv.style.fill=z===Z[2]?HOT:COLD;
  setPara(svg,"ch-p",z.p);setSlider(svg,"lat",X(-40),204,X(40)-X(-40),(la+40)/80,Math.round(la)===0?"Equator":ns)},
 drag:(svg,s,n,x)=>{s.lat=clamp((x-X(-40))/(X(40)-X(-40)),0,1)*80-40},
 tick:(svg,s,dt)=>{const fx=q(svg,".ch-fx");if(!fx)return;s.t+=dt;let h="";
  [-1,1].forEach(d=>{for(let i=0;i<7;i++){const u=(s.t*.05+i/7)%1,p=loop(d,u),L=(GY-8-TOP),W=26*2.2,Pp=2*(L+W),k=u*Pp,up=k<L,dn=k>L+W&&k<2*L+W;
   h+='<circle cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r="2.1" fill="'+(up?"#e8701a":dn?"#f0b400":"#fff")+'" stroke="'+INK+'" stroke-width=".4"/>'}});
  for(let i=0;i<10;i++){const x=X(-6)+rnd(i)*X(6)-rnd(i)*X(-6),y=TOP+30+((s.t*50+rnd(i+11)*60)%(GY-TOP-30));h+='<path d="M'+f1(x)+','+f1(y)+' l-1,3.6" stroke="#2a6db3" stroke-width="1"/>'}
  fx.innerHTML=h}});
add("chadley","climate");
})();

/* ================================================================ 5. Continentality: how far from the sea */
(function(){
/* cities near 55–62°N, going east from the Atlantic coast of Norway; distances rounded, January and July means rounded */
const C=[{nm:"Bergen, Norway",d:0,j:2,u:15},{nm:"Helsinki, Finland",d:1100,j:-4,u:18},{nm:"Perm, Russia",d:3000,j:-14,u:19},{nm:"Novosibirsk, Russia",d:5000,j:-17,u:19},{nm:"Yakutsk, Russia",d:6500,j:-39,u:20}];
const X0=36,X1=270,XD=d=>X0+(X1-X0)*d/6500,YT=58,YB=158,TMIN=-40,TMAX=25,Yt=t=>YB-(t-TMIN)*(YB-YT)/(TMAX-TMIN);
const near=d=>C.reduce((b,c)=>Math.abs(c.d-d)<Math.abs(b.d-d)?c:b,C[0]);
make("ccont",{title:"The further from the sea, the bigger the swing",
 src:"Approximate January and July mean temperatures (long-term averages from national weather services, rounded). Distances: roughly how far east of the Atlantic coast of Norway, rounded.",
 h:214,state:()=>({d:6500}),
 frame:()=>{let h='<rect x="6" y="8" width="290" height="30" rx="7" fill="#c8d6b0"/><path d="M6,15 a7,7 0 0 1 7,-7 H'+(X0-2)+' V38 H13 a7,7 0 0 1 -7,-7 Z" fill="#5b9ed8"/>'+T(10,26,"Atlantic",'font-size="5.4" font-weight="800" fill="#fff"');
  h+=arrow(12,33,X0+18,33,"#fff",1.4)+T(X0+22,35.4,"west winds off the sea",'font-size="5" font-weight="700" fill="#4e6136"');
  C.forEach(c=>h+='<circle cx="'+f1(XD(c.d))+'" cy="21" r="2.4" fill="'+INK+'"/>'+T(f1(Math.min(286,Math.max(c.d?0:X0+4,XD(c.d)))),16,c.nm.split(",")[0],'font-size="5.6" font-weight="800" text-anchor="'+(c.d===0?"start":c.d>6000?"end":"middle")+'" fill="'+INK+'"'));
  h+=T(286,34,"Asia, far inland →",'font-size="5.2" font-weight="700" text-anchor="end" fill="#4e6136"');
  h+='<rect x="'+X0+'" y="'+YT+'" width="'+(X1-X0+14)+'" height="'+(YB-YT)+'" fill="#f7f9fc" stroke="#dde4ec"/>';
  for(let t=-40;t<=20;t+=20)h+='<path d="M'+X0+','+f1(Yt(t))+' H'+(X1+14)+'" stroke="'+(t===0?"#9aa8b8":"#e3e9f0")+'" stroke-width="'+(t===0?.8:.5)+'"/>'+T(X0-3,f1(Yt(t)+2),(t<0?"−":"")+Math.abs(t)+" °C",'font-size="5.6" text-anchor="end" fill="'+SUB+'"');
  for(let d=0;d<=6000;d+=2000)h+=T(f1(XD(d)),YB+8,fmt(d)+" km",'font-size="5.4" text-anchor="middle" fill="'+SUB+'"');
  h+=T(X0,YT-6,"January (blue) to July (red): the bar is the yearly swing",'font-size="5.8" font-weight="700" fill="'+SUB+'"');
  h+='<g class="cc-bars"></g><g class="cc-cur"></g>';
  h+=para("cc-p",8,171,288,26,6.1,INK)+slider("d",X0,204,X1-X0,"Travel inland from the sea");return h},
 draw:(svg,s)=>{const c=near(s.d),r=c.u-c.j;let g="";
  C.forEach(k=>{const x=XD(k.d)+(k.d===0?4:k.d>6000?-4:0),on=k===c,o=on?1:.45;
   g+='<g opacity="'+o+'"'+tip(k.nm+": January "+deg(k.j)+", July "+deg(k.u))+'><rect x="'+f1(x-4)+'" y="'+f1(Yt(k.u))+'" width="8" height="'+f1(Yt(k.j)-Yt(k.u))+'" rx="4" fill="url(#dgCcGr)"/>'+
    '<circle cx="'+f1(x)+'" cy="'+f1(Yt(k.u))+'" r="3" fill="'+HOT+'" stroke="#fff"/><circle cx="'+f1(x)+'" cy="'+f1(Yt(k.j))+'" r="3" fill="'+COLD+'" stroke="#fff"/>'+
    T(f1(x+7),f1((Yt(k.u)+Yt(k.j))/2+2.5),(k.u-k.j)+" °C",'font-size="'+(on?7.4:6)+'" font-weight="900" fill="'+INK+'"')+'</g>'});
  const B=q(svg,".cc-bars");if(B)B.innerHTML='<defs><linearGradient id="dgCcGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e98a5a"/><stop offset="1" stop-color="#6aa3d8"/></linearGradient></defs>'+g;
  const U=q(svg,".cc-cur");if(U)U.innerHTML='<path d="M'+f1(XD(s.d))+',25 V37" stroke="'+ACC+'" stroke-width="1.4"/><circle cx="'+f1(XD(s.d))+'" cy="21" r="4" fill="none" stroke="'+ACC+'" stroke-width="1.6"/>';
  setPara(svg,"cc-p","<b>"+c.nm+"</b>"+(c.d?", "+fmt(c.d)+" km inland":", on the coast")+": January "+deg(c.j)+", July "+deg(c.u)+", a swing of <b>"+r+" °C</b>. "+(c.d===0?"The sea warms and cools slowly, so the coast stays mild all year.":c.d>6000?"No sea stores heat here: the land bakes in summer and freezes in winter. It is the coldest big city on Earth.":"Summers stay much the same, but winters get colder the further you go from the sea."));
  setSlider(svg,"d",X0,204,X1-X0,s.d/6500,fmt(Math.round(s.d/100)*100)+" km")},
 drag:(svg,s,n,x)=>{s.d=clamp((x-X0)/(X1-X0),0,1)*6500}});
add("ccont","climate");
})();

/* ================================================================ wiring to the climate tour */
const STOPS={"climate|Monsoon climates":"cmon","climate|The monsoon and the wettest place":"cmon",
 "climate|Five Mediterraneans":"cmed",
 "climate|London is mild for its latitude":"cmar","climate|London is further north":"cmar",
 "climate|The desert belts":"chadley",
 "climate|The coldest places people live":"ccont"};
/* the continentality diagram goes on "The hottest and coldest ever recorded" only when the tour has no "coldest places" stop */
function wire(){try{Object.entries(STOPS).forEach(([k,v])=>{if(DG[v])PS_DIAG[k]=v});
  const L=PS_TOURS&&PS_TOURS.climate&&PS_TOURS.climate.steps;if(L&&!L.some(s=>s&&s.title==="The coldest places people live"))PS_DIAG["climate|The hottest and coldest ever recorded"]="ccont"}catch(e){}}
window.gfClimSims={STOPS};
wire();window.addEventListener("load",wire);[1500,4000,9000].forEach(ms=>setTimeout(wire,ms));
})();
