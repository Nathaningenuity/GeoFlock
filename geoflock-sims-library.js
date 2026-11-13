/* GeoFlock: the simulation library. Three things:
   1. New stand-alone simulations (not tied to a tour stop), built with the kit in geoflock-sims2.js (window.GFSIM) and
      registered in the shared registry DG like every other diagram, so they also appear in the Models browser.
   2. The Dictionary: a term whose idea is best shown moving opens a "▶ Simulation" section in its entry (the photo, if the
      term has one, stays above it). Reuses the tour simulations where they fit. The Library's Dictionary tab gets a
      "With simulation" chip (geoflock-library.js asks window.gfSimLib).
   3. The Library gets a "Simulations" tab: every simulation on the site, by topic, searchable, each one playable in place,
      with links to the dictionary terms it explains.
   Loaded after geoflock-sims2.js. */
(function(){
"use strict";
if(typeof DG==="undefined"||!window.GFSIM)return;
const K=window.GFSIM,{INK,ACC,SUB,WAT,PAN,T,clamp,lerp,f1,f2,sstep,q,txt,esc,tip,fmt,show,ln,rnd,uid,url,setHTML,slider,setSlider,btn,btnOn,hint,para,setPara,arrow,make,pattern,speckle,tile,rockDefs,landPath,landThin}=K;
const R=Math.PI/180;
/* a colour ramp without d3-interpolate: stops [[t,"#rrggbb"],...] → function(t) → [r,g,b] */
const hexrgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function ramp(stops){const S=stops.map(([t,c])=>[t,hexrgb(c)]);return t=>{t=clamp(t,0,1);for(let i=1;i<S.length;i++)if(t<=S[i][0]){const a=S[i-1],b=S[i],u=(t-a[0])/(b[0]-a[0]||1);return[0,1,2].map(k=>Math.round(a[1][k]+(b[1][k]-a[1][k])*u))}return S[S.length-1][1]}}
const rgbs=c=>"rgb("+c[0]+","+c[1]+","+c[2]+")";
const NEW=[];const mk=(key,o)=>{NEW.push(key);return make(key,o)};

/* ===================================================================== new simulations */
/* (added below, one block each) */

/* ---------------------------------------------------------------- day length at every latitude */
(function(){
/* NOAA's sunrise equation: the Sun's centre 0.833° below the horizon (refraction and the Sun's radius) */
const decl=n=>23.44*Math.sin(2*Math.PI*(284+n)/365);
function dayLen(lat,n){const d=decl(n)*R,p=lat*R,c=(Math.sin(-.833*R)-Math.sin(p)*Math.sin(d))/(Math.cos(p)*Math.cos(d));if(c<=-1)return 24;if(c>=1)return 0;return 2*Math.acos(c)/R/15}
const MON=["J","F","M","A","M","J","J","A","S","O","N","D"],MD=[0,31,59,90,120,151,181,212,243,273,304,334];
const HX0=26,HX1=196,HY0=10,HY1=126;
const xOf=n=>HX0+(n/365)*(HX1-HX0),yOf=l=>HY0+(90-l)/180*(HY1-HY0);
const PLACES=[["Tromsø",69.6],["Reykjavík",64.1],["London",51.5],["New York",40.7],["Cairo",30],["Singapore",1.3],["Cape Town",-33.9],["Ushuaia",-54.8]];
const RMP=ramp([[0,"#141b3d"],[.25,"#2c3f7a"],[.45,"#5a78a8"],[.5,"#8a9fb8"],[.6,"#d9b85a"],[.8,"#f3cf4a"],[1,"#fff3b0"]]);
const col=h=>rgbs(RMP(h/24));
function heat(){return tile("daylen",182,120,(x,w,h)=>{const im=x.createImageData(w,h);for(let j=0;j<h;j++){const lat=90-(j+.5)/h*180;for(let i=0;i<w;i++){const n=(i+.5)/w*365,c=RMP(dayLen(lat,n)/24),k=(j*w+i)*4;im.data[k]=c[0];im.data[k+1]=c[1];im.data[k+2]=c[2];im.data[k+3]=255}}x.putImageData(im,0,0)})}
mk("sldaylen",{title:"Day length at every latitude, all year",cat:"earth",h:214,
 src:"Worked out with NOAA’s solar equations (declination 23.44° × sin of the date; sunrise when the Sun’s centre is 0.833° below the horizon). Times are local solar time.",
 frame:()=>{let h='<image href="'+heat()+'" x="'+HX0+'" y="'+HY0+'" width="'+(HX1-HX0)+'" height="'+(HY1-HY0)+'" preserveAspectRatio="none"/>';
  /* the 12-hour line (equinox) and the polar circles */
  const p12=[];for(let n=0;n<=365;n+=5)p12.push([xOf(n),yOf(0)]);
  [66.56,23.44,0,-23.44,-66.56].forEach(l=>{h+='<path d="M'+HX0+','+f1(yOf(l))+'H'+HX1+'" stroke="#fff" stroke-opacity="'+(l?".35":".6")+'" stroke-width=".5" stroke-dasharray="'+(l?"2 2":"")+'"/>'});
  [["90°N",90],["66°N",66.56],["23°N",23.44],["0°",0],["23°S",-23.44],["66°S",-66.56],["90°S",-90]].forEach(([t,l])=>{h+=T(HX0-3,f1(yOf(l)+2.2),t,'text-anchor="end" font-size="5.6" fill="'+SUB+'"')});
  MON.forEach((m,i)=>{h+=T(f1(xOf(MD[i]+15)),HY1+8,m,'text-anchor="middle" font-size="5.8" fill="'+SUB+'"')});
  h+=T(f1(xOf(80)),HY0+8,"polar night",'text-anchor="middle" font-size="5.6" font-weight="800" fill="#cfd8ff"').replace("polar night","")+T(f1(xOf(362)),f1(yOf(80)),"polar night",'text-anchor="end" font-size="5.6" font-weight="800" fill="#e8ecff"')+T(f1(xOf(172)),f1(yOf(80)),"midnight sun",'text-anchor="middle" font-size="5.6" font-weight="800" fill="#3a2a00"');
  h+='<rect x="'+HX0+'" y="'+HY0+'" width="'+(HX1-HX0)+'" height="'+(HY1-HY0)+'" fill="transparent" data-drag="c"/><g class="dl-x"></g>';
  /* colour key */
  h+='<g transform="translate('+HX0+','+(HY1+13)+')">';for(let i=0;i<24;i++)h+='<rect x="'+f1(i*5)+'" width="5.2" height="4" fill="'+col(i+.5)+'"/>';h+=T(0,11,"0 h",'font-size="5.4" fill="'+SUB+'"')+T(60,11,"12 h",'text-anchor="middle" font-size="5.4" fill="'+SUB+'"')+T(120,11,"24 h of daylight",'text-anchor="end" font-size="5.4" fill="'+SUB+'"')+'</g>';
  h+='<g transform="translate(204,10)"><rect width="90" height="128" rx="8" fill="#fff"/><g class="dl-p"></g></g>';
  h+='<g class="dl-c"></g>'+hint(8,210,"Drag the cross anywhere: pick a latitude and a date");
  return h},
 state:()=>({lat:51.5,n:172}),
 draw:(svg,s)=>{const L=dayLen(s.lat,s.n),x=xOf(s.n),y=yOf(s.lat);
  setHTML(svg,".dl-x",'<path d="M'+f1(x)+','+HY0+'V'+HY1+'M'+HX0+','+f1(y)+'H'+HX1+'" stroke="#fff" stroke-width=".8" stroke-dasharray="2 1.5"/><g class="dg-handle" data-drag="c" transform="translate('+f1(x)+','+f1(y)+')"><circle r="12" fill="transparent"/><circle r="4.6" fill="none" stroke="#fff" stroke-width="2"/><circle r="4.6" fill="none" stroke="'+ACC+'" stroke-width="1.2"/></g>');
  const d=new Date(Date.UTC(2025,0,1)+s.n*864e5),ds=d.getUTCDate()+" "+["January","February","March","April","May","June","July","August","September","October","November","December"][d.getUTCMonth()];
  const hm=v=>{const m=Math.round(v*60);return Math.floor(m/60)+" h "+String(m%60).padStart(2,"0")+" min"},tm=v=>{v=(v+24)%24;const m=Math.round(v*60)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")};
  let near=PLACES.reduce((a,b)=>Math.abs(b[1]-s.lat)<Math.abs(a[1]-s.lat)?b:a);
  const la=Math.abs(s.lat).toFixed(1)+"°"+(s.lat>=0?"N":"S");
  let p=T(8,14,ds,'font-size="8.4" font-weight="900" fill="'+INK+'"')+T(8,23,la+(Math.abs(near[1]-s.lat)<2?" · "+near[0]:""),'font-size="6.4" font-weight="700" fill="'+SUB+'"');
  p+=T(8,38,"Daylight",'font-size="6" fill="'+SUB+'"')+T(8,50,L>=23.99?"24 hours":L<=.01?"none":hm(L),'font-size="10" font-weight="900" fill="'+INK+'"');
  p+='<rect x="8" y="55" width="74" height="7" rx="3.5" fill="#24305a"/><rect x="'+f1(8+(12-L/2)/24*74)+'" y="55" width="'+f1(L/24*74)+'" height="7" rx="3.5" fill="#f6c443"/>';
  p+=T(8,72,L>=23.99?"The Sun never sets":L<=.01?"The Sun never rises":"Sunrise "+tm(12-L/2)+" · sunset "+tm(12+L/2),'font-size="5.8" font-weight="700" fill="'+INK+'"');
  const noon=90-Math.abs(s.lat-decl(s.n));p+=T(8,86,"Sun at midday",'font-size="6" fill="'+SUB+'"')+T(8,96,noon>0?Math.round(noon)+"° above the horizon":"below the horizon",'font-size="7" font-weight="800" fill="'+INK+'"');
  const yr=[];for(let n=0;n<=365;n+=7)yr.push(dayLen(s.lat,n));const mx=Math.max(...yr),mn=Math.min(...yr);p+=T(8,110,"Through the year",'font-size="6" fill="'+SUB+'"')+T(8,120,hm(mn).replace(" min","m")+" to "+hm(mx).replace(" min","m"),'font-size="6.4" font-weight="800" fill="'+INK+'"');
  setHTML(svg,".dl-p",p);
  /* this latitude through the year */
  const pts=[];for(let n=0;n<=365;n+=3)pts.push([xOf(n),186-dayLen(s.lat,n)/24*36]);
  let c='<rect x="'+HX0+'" y="150" width="'+(HX1-HX0)+'" height="36" fill="#eef3f8"/><path d="M'+HX0+',168H'+HX1+'" stroke="#9fb2c4" stroke-width=".5" stroke-dasharray="2 2"/>'+T(HX0-3,152,"24h",'text-anchor="end" font-size="5.4" fill="'+SUB+'"')+T(HX0-3,170,"12h",'text-anchor="end" font-size="5.4" fill="'+SUB+'"')+T(HX0-3,188,"0h",'text-anchor="end" font-size="5.4" fill="'+SUB+'"');
  c+='<path d="'+ln(pts)+'L'+HX1+',186L'+HX0+',186Z" fill="#f6c443" opacity=".55"/><path d="'+ln(pts)+'" fill="none" stroke="#c98a00" stroke-width="1.3"/><circle cx="'+f1(x)+'" cy="'+f1(186-L/24*36)+'" r="2.6" fill="'+ACC+'" stroke="#fff" stroke-width=".7"/>'+T(HX1+6,170,"daylight at "+la,'font-size="6" font-weight="700" fill="'+SUB+'"')+T(HX1+6,179,"through the year",'font-size="6" font-weight="700" fill="'+SUB+'"');
  setHTML(svg,".dl-c",c)},
 drag:(svg,s,n,x,y)=>{if(y>HY1+2)return false;s.n=clamp((x-HX0)/(HX1-HX0),0,1)*365;s.lat=clamp(90-(y-HY0)/(HY1-HY0)*180,-89.9,89.9)}});
})();

/* ---------------------------------------------------------------- the greenhouse effect */
(function(){
/* one-layer model: an atmosphere that absorbs a share e of the heat the ground gives off, and gives it back up and down.
   Surface temperature Ts = Te × (2 / (2 − e))^¼, with Te = 255 K (Earth seen from space). e = 0.756 gives 14 °C. */
const Te=255,tsOf=e=>Te*Math.pow(2/(2-e),.25)-273.15;
/* The marks were placed so that "today" read 16 °C on the thermometer and only 1.0 °C above 1850, while the text said 15 °C
   and 1.3 °C. They are now solved from the formula: 1850 at 14.0 °C (e = 0.756), today 1.3 °C warmer at 15.3 °C (0.7785;
   WMO State of the Global Climate 2024: the 2015–2024 decade was about 1.24 °C above 1850–1900), and doubled CO₂ 3 °C
   above 1850 at 17.0 °C (0.807; IPCC AR6 best estimate of equilibrium climate sensitivity, 3 °C). */
const MARKS=[[0,"none"],[.756,"1850"],[.7785,"today"],[.807,"2× CO₂"]];
/* the slider is stretched near today's value */
const eOf=f=>f<=.5?f/.5*.7:.7+(f-.5)/.5*.15,fOf=e=>e<=.7?e/.7*.5:.5+(e-.7)/.15*.5;
const halo='stroke="#0d1838" stroke-width="2" paint-order="stroke"';
mk("slgreenhouse",{title:"The greenhouse effect: a blanket of gases",cat:"climate",h:216,
 src:"Energy flows (W/m², global average): IPCC AR6 WG1 Figure 7.2 (340 in, 100 reflected, 239 out, 398 from the ground, 342 back down). Temperature from a one-layer model tuned to today’s 15 °C; real warming depends on feedbacks.",
 defs:()=>'<linearGradient id="dgGhSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1838"/><stop offset=".45" stop-color="#2a5d9a"/><stop offset="1" stop-color="#9fd0f0"/></linearGradient>'+
  '<linearGradient id="dgGhGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9a4a"/><stop offset="1" stop-color="#4a6a32"/></linearGradient>'+
  '<radialGradient id="dgGhSun"><stop offset="0" stop-color="#fff6c0"/><stop offset=".4" stop-color="#ffd24a"/><stop offset="1" stop-color="#ffb02a" stop-opacity="0"/></radialGradient>',
 frame:()=>{let h='<rect x="6" y="6" width="210" height="152" rx="8" fill="url(#dgGhSky)"/>';for(let i=0;i<30;i++)h+='<circle cx="'+f1(10+rnd(i*3.7)*200)+'" cy="'+f1(9+rnd(i*1.3)*30)+'" r=".5" fill="#fff" opacity=".6"/>';
  h+='<circle cx="28" cy="22" r="20" fill="url(#dgGhSun)"/>'+T(28,24,"Sun",'text-anchor="middle" font-size="6.6" font-weight="900" fill="#5a3a00"');
  h+='<path d="M6,138 Q60,128 110,134 T216,132 V150 a8,8 0 0 1 -8,8 H14 a8,8 0 0 1 -8,-8Z" fill="url(#dgGhGround)"/><path d="M150,134 Q182,128 216,131 V150 a8,8 0 0 1 -8,8 H150Z" fill="#2f6ea8"/>';
  for(let i=0;i<9;i++){const x=20+i*13,y=133-rnd(i)*2;h+='<path d="M'+x+','+y+' v-5" stroke="#5a3a20" stroke-width="1"/><circle cx="'+x+'" cy="'+(y-7)+'" r="3.4" fill="#3f7a3a"/>'}
  h+='<rect x="6" y="56" width="210" height="34" fill="#c9e3f7" class="gh-layer"/>'+T(10,64,"greenhouse gases in the air",'font-size="5.8" font-weight="800" fill="#173f6e"')+'<g class="gh-mol"></g><g class="gh-ar"></g>';
  h+='<g transform="translate(224,6)"><rect width="70" height="152" rx="8" fill="#fff"/>'+T(35,13,"Ground",'text-anchor="middle" font-size="6.4" font-weight="800" fill="'+SUB+'"')+T(35,21,"temperature",'text-anchor="middle" font-size="6.4" font-weight="800" fill="'+SUB+'"')+
   '<rect x="30" y="30" width="10" height="96" rx="5" fill="#eef2f6" stroke="#c9d3dc"/><circle cx="35" cy="132" r="9" fill="#d2452b"/><rect class="gh-th" x="32.5" width="5" rx="2.5" fill="#d2452b"/>';
  [-20,0,20,40].forEach(v=>{const y=126-(v+25)/70*92;h+='<path d="M41,'+f1(y)+'h4" stroke="#9fb2c4"/>'+T(47,f1(y+2),v+"°",'font-size="5.4" fill="'+SUB+'"')});
  h+='<text class="gh-t" x="35" y="150" text-anchor="middle" font-size="9" font-weight="900" fill="#d2452b"></text></g>';
  h+='<text class="gh-big" x="8" y="170" font-size="8" font-weight="900" fill="'+INK+'"></text>'+slider("e",14,192,276,"How much heat the air traps")+'<g class="gh-mk"></g>'+hint(8,213,"Drag: more greenhouse gas traps more heat, and the ground warms");
  return h},
 state:()=>({e:.7785}),
 draw:(svg,s)=>{const e=s.e,ts=tsOf(e),G=5.67e-8*Math.pow(ts+273.15,4),back=e*G,out=239;/* W/m² */
  const W=v=>Math.max(.8,v/30);let a="";
  /* sunlight in, some reflected */
  a+=arrow(40,32,76,126,"#ffd24a",W(160),6)+arrow(88,126,112,40,"#fff6c0",W(100),5);
  a+=arrow(146,132,150,28,"#ff7a3a",W(G)/1.6,6)+arrow(184,62,178,128,"#ff5a3a",W(back)/1.6,6)+arrow(200,60,206,18,"#ff9a6a",W(out)/1.6,5);
  a+=T(30,52,"sunlight in: 340",'font-size="6" font-weight="800" fill="#ffe7a0" '+halo)+T(96,36,"100 reflected",'font-size="5.8" font-weight="800" fill="#fff" '+halo)+
   T(122,104,"ground gives off "+Math.round(G),'font-size="6" font-weight="800" fill="#ffd0b0" '+halo)+T(212,112,Math.round(back)+" sent back down",'text-anchor="end" font-size="6" font-weight="800" fill="#ffe0d0" '+halo)+T(210,14,"239 out to space",'text-anchor="end" font-size="5.8" font-weight="800" fill="#ffd0b0" '+halo);
  setHTML(svg,".gh-ar",a);
  let m="";const n=Math.round(e*40);for(let i=0;i<n;i++){const x=10+rnd(i*5.3)*200,y=59+rnd(i*2.1)*28;m+='<g transform="translate('+f1(x)+','+f1(y)+')"><circle r="1.4" fill="#3a3a3a"/><circle cx="-2.3" r="1.1" fill="#d2452b"/><circle cx="2.3" r="1.1" fill="#d2452b"/></g>'}
  setHTML(svg,".gh-mol",m);const L=q(svg,".gh-layer");if(L)L.setAttribute("opacity",f2(.15+e*.45));
  const th=q(svg,".gh-th");if(th){const y=126-(ts+25)/70*92;th.setAttribute("y",f1(y));th.setAttribute("height",f1(132-y))}
  txt(svg,".gh-t",Math.round(ts)+" °C");
  txt(svg,".gh-big",e<.05?"No greenhouse gases: Earth would be a frozen −18 °C":e<.767?"Before 1850: about 14 °C on average":e<.79?"Today: about 15 °C, 1.3 °C warmer than in 1850":"More CO₂: "+(tsOf(e)-14).toFixed(1)+" °C warmer than 1850, until heat out = sunlight in");
  let mk2="";MARKS.forEach(([v,t],i)=>{const x=14+fOf(v)*276;mk2+='<path d="M'+f1(x)+',196v3" stroke="#9fb2c4"/>'+T(f1(x),203,t,'text-anchor="'+(v<.1?"start":"middle")+'" font-size="5.2" fill="'+SUB+'"')});setHTML(svg,".gh-mk",mk2);
  setSlider(svg,"e",14,192,276,fOf(e),Math.round(e*100)+"% of the ground’s heat")},
 drag:(svg,s,n,x)=>{s.e=eOf(clamp((x-14)/276,0,1))}});
})();

/* ---------------------------------------------------------------- ice pushes the crust down: isostasy */
(function(){
const RI=917,RM=3300;/* density of ice and of the mantle, kg/m³ */
mk("slisostasy",{title:"Ice pushes the land down, and it springs back",cat:"plates",h:216,
 src:"Floating balance (isostasy): the crust sinks by ice thickness × 917/3300, about 28%. Rebound: Hudson Bay and the Gulf of Bothnia still rise up to about 1 cm a year (NASA GRACE; Lantmäteriet). Relaxation time about 4,000 years (Peltier). Not to scale.",
 defs:()=>rockDefs("dgIs")+'<linearGradient id="dgIsIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b9dcf2"/></linearGradient>',
 frame:()=>'<rect x="6" y="6" width="288" height="150" rx="8" fill="url(#dgIsSky)"/><g class="is-g"></g><rect x="6" y="6" width="288" height="150" rx="8" fill="none" stroke="#9fb2c4" stroke-width=".6"/>'+
  '<text class="is-big" x="8" y="168" font-size="8.4" font-weight="900" fill="'+INK+'"></text><text class="is-sub" x="8" y="178" font-size="6.6" font-weight="700" fill="'+SUB+'"></text>'+slider("h",14,198,200,"Ice sheet thickness")+btn("melt",226,190,68,"Melt the ice")+hint(8,214,"Pile on ice, then melt it: the land rises for thousands of years"),
 state:()=>({H:2.5,sink:2.5*RI/RM,melt:0,yrs:0}),
 draw:(svg,s)=>{const sea=58,cy=74,k=24;/* px per km of depression (exaggerated) */const d=s.sink;let h="";
  const prof=x=>Math.exp(-Math.pow((x-150)/70,2));
  /* the mantle lies under the crust: it was drawn from y=58, so a band of red mantle showed above the land at both ends */
  h+='<rect x="6" y="'+(cy+20)+'" width="288" height="'+(136-cy)+'" fill="url(#'+uid(svg,"dgIsMant")+')"/>';
  /* the crust bends down under the ice */
  const top=[],bot=[];for(let x=6;x<=294;x+=3){const dd=d*k*prof(x);top.push([x,cy+dd]);bot.push([x,cy+34+dd])}
  h+='<path d="'+ln(top)+'L'+ln(bot.slice().reverse()).slice(1)+'Z" fill="url(#'+uid(svg,"dgIsCrust")+')" stroke="#5a4030" stroke-width=".5"/>';
  h+='<path d="'+ln(top)+'" fill="none" stroke="#6f8f4e" stroke-width="2"/>';
  /* the sea fills the dip near the coast when the ice has gone */
  if(s.melt){const wet=top.filter(p=>p[1]>cy+1.2);if(wet.length>2)h+='<path d="M'+f1(wet[0][0])+','+f1(cy+1.2)+ln(wet).replace("M","L")+'L'+f1(wet[wet.length-1][0])+','+f1(cy+1.2)+'Z" fill="#3d8fd1" opacity=".8"/>'}
  /* the ice */
  const ice=s.melt?Math.max(0,s.H*(1-s.yrs/600)):s.H;if(ice>.01){const ip=[];for(let x=40;x<=260;x+=3){const u=(x-150)/110,th=ice*22*Math.sqrt(Math.max(0,1-u*u));ip.push([x,cy+d*k*prof(x)-th])}
   h+='<path d="'+ln(ip)+'L'+ln(top.filter(p=>p[0]>=40&&p[0]<=260).reverse()).slice(1)+'Z" fill="url(#'+uid(svg,"dgIsIce")+')" stroke="#8fc0e0" stroke-width=".6"/>'+T(150,f1(cy+d*k-ice*22+12),fmt(ice*1000)+" m of ice",'text-anchor="middle" font-size="6.8" font-weight="900" fill="#1d4f86"')}
  /* raised beaches: old shorelines left high as the land rises */
  if(s.melt&&s.yrs>800){for(let i=0;i<3;i++){const x=70+i*8,y=cy+d*k*prof(x)-2-i*1.5;h+='<path d="M'+(x-4)+','+f1(y)+'h8" stroke="#e3cf98" stroke-width="1.6"/>'}h+=T(54,f1(cy-12),"old beaches, now high and dry",'font-size="5.8" font-weight="800" fill="'+INK+'"')}
  h+=T(12,cy+24,"crust",'font-size="6.4" font-weight="800" fill="#fff"')+T(12,148,"mantle: flows slowly, like very thick syrup",'font-size="6.2" font-weight="800" fill="#fff0de"');
  if(d>.05)h+=arrow(150,cy+40,150,cy+40+Math.min(26,d*k*.8),"#fff",1.4,4)+T(156,cy+50,"pushed down "+fmt(d*1000)+" m",'font-size="6.2" font-weight="800" fill="#fff"');
  setHTML(svg,".is-g",h);
  txt(svg,".is-big",s.melt?(s.yrs<20?"The ice melts…":"After "+fmt(s.yrs*20)+" years: still "+fmt(d*1000)+" m to rise"):"Ice "+fmt(s.H*1000)+" m thick pushes the land down "+fmt(s.H*RI/RM*1000)+" m");
  txt(svg,".is-sub",s.melt?"The mantle flows back slowly, so the land keeps rising long after the ice has gone":"Like a loaded raft, the crust floats lower on the mantle");
  setSlider(svg,"h",14,198,200,s.H/3.5,fmt(s.H*1000)+" m");btnOn(svg,"melt",!!s.melt,s.melt?"Ice again":"Melt the ice")},
 drag:(svg,s,n,x)=>{s.melt=0;s.yrs=0;s.H=clamp((x-14)/200,0,1)*3.5;s.sink=s.H*RI/RM},
 act:(svg,s,a)=>{if(a==="melt"){if(s.melt){s.melt=0;s.yrs=0;s.sink=s.H*RI/RM}else{s.melt=1;s.yrs=0}return true}},
 tick:(svg,s,dt)=>{if(!s.melt)return;if(s.yrs>1200&&s.sink<.005)return;s.yrs+=dt*60;/* 1 unit = 20 years */const left=s.H*(1-s.yrs/600)*RI/RM,eq=Math.max(0,left);s.sink=eq+(s.sink-eq)*Math.exp(-dt*60*20/4000);DG.slisostasy._d(svg,s)}});
})();

/* ---------------------------------------------------------------- sea and land breezes */
(function(){
/* land warms and cools much faster than the sea: a typical summer day on a coast */
const landT=h=>17+8*Math.sin(2*Math.PI*(h-9)/24),seaT=h=>19+.6*Math.sin(2*Math.PI*(h-14)/24);
mk("slseabreeze",{title:"Sea breeze by day, land breeze by night",cat:"climate",h:206,
 src:"A summer day on a mid-latitude coast, rounded: land air swings about ±8 °C, the sea under ±1 °C. Sea breezes blow at about 10–20 km/h and can reach 20–50 km inland (Met Office; Simpson 1994, Sea Breeze and Local Winds).",
 defs:()=>'<linearGradient id="dgSbDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fbbe8"/><stop offset="1" stop-color="#e3f1fb"/></linearGradient><linearGradient id="dgSbNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1838"/><stop offset="1" stop-color="#2a4a7a"/></linearGradient>'+
  '<linearGradient id="dgSbSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d8fd1"/><stop offset="1" stop-color="#1d4f86"/></linearGradient>'+pattern("dgSbSand",speckle("sand2","#e7d3a1",["#cdb47c","#f3e4bd"],400,.9),16,16),
 frame:()=>'<rect class="sb-sky" x="6" y="6" width="288" height="140" rx="8" fill="url(#dgSbDay)"/><rect class="sb-sky2" x="6" y="6" width="288" height="140" rx="8" fill="url(#dgSbNight)" opacity="0"/><g class="sb-sun"></g>'+
  '<path d="M6,118 H150 V146 H14 a8,8 0 0 1 -8,-8Z" fill="url(#dgSbSea)"/><path d="M146,118 q8,-3 16,-3 L294,108 V138 a8,8 0 0 1 -8,8 H146Z" fill="#7da35a"/><path d="M146,118 q8,-3 16,-3 l6,0 v31 h-22Z" fill="url(#dgSbSand)"/>'+
  '<g>'+[190,214,240,262,280].map((x,i)=>'<rect x="'+x+'" y="'+(96-i%2*8)+'" width="12" height="'+(16+i%2*8)+'" fill="#d9d2c4" stroke="#8a8070" stroke-width=".4"/><path d="M'+(x-1)+','+(96-i%2*8)+' l7,-6 l7,6Z" fill="#b5543c"/>').join("")+'</g>'+
  '<g class="sb-air"></g><g class="sb-t"></g><text class="sb-big" x="8" y="158" font-size="8.4" font-weight="900" fill="'+INK+'"></text><text class="sb-sub" x="8" y="168" font-size="6.6" font-weight="700" fill="'+SUB+'"></text>'+slider("h",14,188,206,"Time of day")+btn("play",232,180,62,"▶ Play")+hint(8,204,"Drag the time: the wind turns round between day and night"),
 state:()=>({h:14,play:0,ph:0}),
 draw:(svg,s)=>{const h=s.h,L=landT(h),S=seaT(h),d=L-S,day=h>6&&h<20;const n2=q(svg,".sb-sky2");if(n2)n2.setAttribute("opacity",f2(clamp(Math.cos((h-13)/24*2*Math.PI)*-1.2+.2,0,1)));
  const sa=(h-6)/12*Math.PI;let su="";if(day){const x=150-Math.cos(sa)*120,y=110-Math.sin(sa)*90;su='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="9" fill="#ffd24a"/><circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="14" fill="#ffd24a" opacity=".25"/>'}else{su='<circle cx="250" cy="28" r="6" fill="#eef0f6"/><circle cx="253" cy="26" r="5.4" fill="#0f1a3a"/>'}setHTML(svg,".sb-sun",su);
  /* the circulation: low level from cool to warm, rising over the warm side, back aloft */
  const str=clamp(Math.abs(d)/6,0,1),dir=d>0?1:-1;let a="";
  if(str>.08){const yb=104,yt=40,x0=60,x1=240,ph=s.ph;const c=d>0?"#1d4f86":"#5a3a8a";
   const loop=[[x0,yb],[x1,yb],[x1,yt],[x0,yt]];if(dir<0)loop.reverse();
   a+='<path d="M'+(dir>0?x0:x1)+','+yb+' H'+(dir>0?x1-14:x0+14)+' Q'+(dir>0?x1:x0)+','+yb+' '+(dir>0?x1:x0)+','+(yb-14)+' V'+(yt+14)+' Q'+(dir>0?x1:x0)+','+yt+' '+(dir>0?x1-14:x0+14)+','+yt+' H'+(dir>0?x0+14:x1-14)+' Q'+(dir>0?x0:x1)+','+yt+' '+(dir>0?x0:x1)+','+(yt+14)+' V'+(yb-14)+'" fill="none" stroke="'+c+'" stroke-width="'+f1(1+str*2.6)+'" stroke-dasharray="7 5" stroke-dashoffset="'+f1(-ph*(4+str*10))+'" opacity=".85"/>';
   a+=arrow(dir>0?120:180,yb,dir>0?160:140,yb,c,1.6+str*2,6);
   /* the land breeze is the weaker of the two (AMS Glossary of Meteorology, "land breeze"): it had the sea breeze's 20 km/h.
      Label moved over the sea so it no longer runs into the houses */
   a+=T(98,yb-6,dir>0?"sea breeze · about "+Math.round(5+str*15)+" km/h":"land breeze · gentler than by day",'text-anchor="middle" font-size="6.8" font-weight="900" fill="'+(day?INK:"#fff")+'"');
   if(dir>0&&str>.5)a+='<g opacity="'+f2(str)+'"><circle cx="232" cy="36" r="9" fill="#fff"/><circle cx="244" cy="32" r="11" fill="#fff"/><circle cx="256" cy="37" r="8" fill="#fff"/><rect x="226" y="36" width="36" height="8" fill="#fff"/></g>'+T(244,56,"clouds pop up inland",'text-anchor="middle" font-size="5.6" font-weight="700" fill="'+INK+'"')}
  setHTML(svg,".sb-air",a);
  setHTML(svg,".sb-t",'<g transform="translate(14,124)"><rect width="56" height="16" rx="5" fill="#fff" opacity=".9"/>'+T(5,7,"sea",'font-size="5.4" fill="'+SUB+'"')+T(5,14,Math.round(S)+" °C",'font-size="7" font-weight="900" fill="#1d4f86"')+'</g><g transform="translate(222,124)"><rect width="62" height="16" rx="5" fill="#fff" opacity=".9"/>'+T(5,7,"land",'font-size="5.4" fill="'+SUB+'"')+T(5,14,Math.round(L)+" °C",'font-size="7" font-weight="900" fill="#b5401c"')+'</g>');
  txt(svg,".sb-big",Math.abs(d)<.8?"Calm: land and sea are the same temperature":d>0?"Day: the land is "+Math.round(d)+" °C warmer than the sea":"Night: the land is "+Math.round(-d)+" °C cooler than the sea");
  txt(svg,".sb-sub",Math.abs(d)<.8?"No difference in pressure, so no breeze":d>0?"Warm air rises over the land; cooler sea air flows in to replace it":"Air sinks over the cold land and drifts out to sea");
  const hh=Math.floor(h),mm=Math.round((h-hh)*60)%60;setSlider(svg,"h",14,188,206,h/24,String(hh%24).padStart(2,"0")+":"+String(mm).padStart(2,"0"));btnOn(svg,"play",!!s.play,s.play?"❚❚ Pause":"▶ Play")},
 drag:(svg,s,n,x)=>{s.play=0;s.h=clamp((x-14)/206,0,.999)*24},
 act:(svg,s,a)=>{if(a==="play"){s.play=!s.play;return true}},
 tick:(svg,s,dt)=>{s.ph+=dt;if(s.play)s.h=(s.h+dt*1.6)%24;DG.slseabreeze._d(svg,s)}});
})();


/* ---------------------------------------------------------------- El Niño and La Niña */
(function(){
/* sea surface temperature (°C) across the tropical Pacific: a warm pool in the west, a cold tongue in the east;
   s from −1 (strong La Niña) to +1 (strong El Niño) adds the anomaly. lon in 0–360. */
function sst(lon,lat,s){const x=(lon+360)%360,teq=x<=180?29.5:x<=250?29.5-(x-180)/70*4.5:25-(x-250)/30*3.5;
 let T=28.6-.0085*lat*lat-(28.6-teq)*Math.exp(-Math.pow(lat/6,2));if(lat<2&&lat>-24)T-=3*Math.exp(-Math.pow((x-284+lat*.25)/5,2));
 if(s>0)T+=-.9*s*Math.exp(-Math.pow((x-140)/25,2))*Math.exp(-Math.pow(lat/14,2))+2.6*s*Math.exp(-Math.pow((x-225)/40,2))*Math.exp(-Math.pow(lat/10,2))+2.4*s*Math.exp(-Math.pow((x-280)/8,2))*Math.exp(-Math.pow((lat+6)/10,2));
 else T+=1.7*s*Math.exp(-Math.pow((x-208)/36,2))*Math.exp(-Math.pow(lat/9,2))-.5*s*Math.exp(-Math.pow((x-135)/20,2))*Math.exp(-Math.pow(lat/14,2));return T}
const RMP=ramp([[0,"#1d3f8a"],[.3,"#3f86c4"],[.5,"#7fd0d8"],[.65,"#f2e27a"],[.8,"#f5a03a"],[1,"#c8301e"]]);
const MX0=6,MX1=294,MY0=6,MY1=70;let PJ=null;
const proj=()=>PJ||(PJ=d3.geoEquirectangular().rotate([160,0]).fitExtent([[MX0,MY0],[MX1,MY1]],{type:"MultiPoint",coordinates:[[110,-30],[-70,30]]}));
const lonX=lon=>proj()([lon,0])[0];
function sstImg(s){const w=144,h=32,P=proj();const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d"),im=x.createImageData(w,h);
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const ll=P.invert([MX0+(i+.5)/w*(MX1-MX0),MY0+(j+.5)/h*(MY1-MY0)]);const v=RMP((sst(ll[0],ll[1],s)-19)/12),k=(j*w+i)*4;im.data[k]=v[0];im.data[k+1]=v[1];im.data[k+2]=v[2];im.data[k+3]=255}
 x.putImageData(im,0,0);return c.toDataURL()}
/* The strongest El Niño reached only +1.6 °C in the Niño 3.4 box, though the source line (and NOAA's Oceanic Niño Index:
   +2.4 in 1997–98, +2.6 in 2015–16) says the strongest are about +2.4 °C. The warm anomaly is now centred a little further
   west so the far end of the slider reaches +2.4 °C there, and warms the coast of Peru more (1997–98 brought about +4 °C
   there: NOAA). Strength names follow NOAA's ONI thresholds (0.5, 1.5 and 2.0 °C). */
mk("slnino",{title:"El Niño and La Niña: the Pacific sloshes",cat:"climate",h:236,
 src:"Pattern after NOAA Climate Prediction Center and NOAA PMEL (TAO array): warm pool about 29–30 °C, cold tongue off Peru about 20–24 °C; the thermocline about 150 m deep in the west and 50 m in the east. Strongest El Niños: 1997–98 and 2015–16, about +2.4 to +2.6 °C in the Niño 3.4 region.",
 frame:()=>{const P=proj();const land=landPath("nino",P,f=>{try{const b=d3.geoBounds(f);return b[1][1]>-40&&b[0][1]<40}catch(e){return false}});
  let h='<clipPath id="dgNiClip"><rect x="'+MX0+'" y="'+MY0+'" width="'+(MX1-MX0)+'" height="'+(MY1-MY0)+'" rx="6"/></clipPath><g clip-path="url(#dgNiClip)"><image class="ni-img" x="'+MX0+'" y="'+MY0+'" width="'+(MX1-MX0)+'" height="'+(MY1-MY0)+'" preserveAspectRatio="none"/><path d="'+land+'" fill="#cbbf98" stroke="#8e8462" stroke-width=".4"/>';
  const g=(d3.geoPath(P)(d3.geoGraticule().step([30,10])())||"").replace(/(\.\d)\d+/g,"$1");h+='<path d="'+g+'" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width=".4"/><path d="M'+MX0+','+f1(P([0,0])[1])+'H'+MX1+'" stroke="#fff" stroke-opacity=".6" stroke-width=".6" stroke-dasharray="3 2"/></g>';
  [["Australia",134,-24],["Indonesia",117,-1],["Peru",-74,-11],["Hawaii",-157,21]].forEach(([n,lo,la])=>{const p=P([lo,la]);h+=T(f1(p[0]),f1(p[1]),n,'text-anchor="middle" font-size="5.8" font-weight="800" fill="#4a4030"')});
  const n1=P([-170,5]),n2=P([-120,-5]);h+='<rect x="'+f1(n1[0])+'" y="'+f1(n1[1])+'" width="'+f1(n2[0]-n1[0])+'" height="'+f1(n2[1]-n1[1])+'" fill="none" stroke="#fff" stroke-width=".8" stroke-dasharray="2 1.5"/>'+T(f1(n1[0]+1),f1(n1[1]-2),"Niño 3.4",'font-size="5.4" font-weight="800" fill="#fff"');
  h+='<g class="ni-x"></g><text class="ni-big" x="8" y="174" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("ni-tx",8,177,286,26,6.3)+slider("s",14,214,276,"La Niña  ←  neutral  →  El Niño")+hint(8,232,"Drag: watch the warm water, the winds and the rain move across the Pacific");
  return h},
 state:()=>({s:0}),
 draw:(svg,s0)=>{const s=s0.s;if(s0._img!==Math.round(s*20)){s0._img=Math.round(s*20);const im=q(svg,".ni-img");if(im)im.setAttribute("href",sstImg(s0._img/20))}
  const Y0=76,SS=112,BOT=160,k=(BOT-SS)/300;const xw=lonX(150),xe=lonX(-82);let h='<rect x="'+MX0+'" y="'+Y0+'" width="'+(MX1-MX0)+'" height="'+(SS-Y0)+'" fill="#dceefa"/>';
  /* the thermocline: deep in the west, shallow in the east; flatter in El Niño, steeper in La Niña */
  const dW=160-35*Math.max(0,s)+20*Math.max(0,-s),dE=45+95*Math.max(0,s)+28*Math.min(0,s);
  const tc=[],surf=[];for(let x=MX0;x<=MX1;x+=4){const u=clamp((x-xw)/(xe-xw),0,1),d=lerp(dW,dE,Math.pow(u,1.4));tc.push([x,SS+d*k]);const ll=proj().invert([x,40]);surf.push(sst(ll[0],0,s))}
  h+='<rect x="'+MX0+'" y="'+SS+'" width="'+(MX1-MX0)+'" height="'+(BOT-SS)+'" fill="#1d4f86"/>';
  /* warm water above the thermocline, coloured by its temperature */
  for(let i=0;i<tc.length-1;i++){const c=RMP((surf[i]-19)/12);h+='<rect x="'+f1(tc[i][0])+'" y="'+SS+'" width="4.4" height="'+f1(tc[i][1]-SS)+'" fill="'+rgbs(c)+'"/>'}
  h+='<path d="'+ln(tc)+'" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="3 2"/>'+T(MX0+4,f1(tc[2][1]+8),"thermocline · "+Math.round(dW)+" m",'font-size="5.6" font-weight="800" fill="#e4f0ff"')+T(MX1-4,f1(Math.min(BOT-2,tc[tc.length-2][1]+8)),Math.round(dE)+" m",'text-anchor="end" font-size="5.6" font-weight="800" fill="#e4f0ff"')+T(150,BOT-4,"cold deep water",'text-anchor="middle" font-size="5.8" font-weight="800" fill="#bcd7f2"');
  /* the Walker circulation: rising air and rain over the warmest water */
  /* air rises where the sea is warmer than about 28 °C */let sw=0,sx=0;surf.forEach((v,i)=>{const w=Math.max(0,v-28);sw+=w;sx+=w*tc[i][0]});const xr=clamp(sw?sx/sw:60,40,MX1-60),str=1-s*.7;
  h+='<path d="M'+f1(xr)+','+(SS-6)+' V'+(Y0+8)+' H'+f1(Math.min(MX1-14,xr+120))+' V'+(SS-10)+'" fill="none" stroke="#5b6b80" stroke-width="'+f1(.6+str*.9)+'" stroke-dasharray="4 3" opacity=".8"/>';
  h+='<g transform="translate('+f1(xr)+','+(Y0+10)+')"><circle cx="-8" cy="2" r="7" fill="#fff"/><circle cx="2" cy="-1" r="9" fill="#fff"/><circle cx="11" cy="3" r="6" fill="#fff"/><rect x="-14" y="2" width="30" height="7" fill="#fff"/><path d="M-10,11 l-2,8 M-3,11 l-2,9 M4,11 l-2,8 M11,11 l-2,9" stroke="#3d8fd1" stroke-width="1"/></g>'+T(f1(xr+20),Y0+8,"rain",'font-size="6" font-weight="800" fill="#2f6ea8"');
  /* trade winds at the surface */
  const tw=clamp(1-s*1.05,-.3,1.5);if(Math.abs(tw)>.08)for(let i=0;i<3;i++){const x=lonX(-100-i*30);h+=arrow(x,SS-5,x-tw*22,SS-5,"#1d3047",1.3,4)}
  h+=T(lonX(-125),SS-10,tw>.08?"trade winds"+(tw>1.1?" (strong)":tw<.5?" (weak)":""):"trade winds stall",'text-anchor="middle" font-size="5.8" font-weight="800" fill="'+INK+'"');
  /* upwelling off Peru */
  const up=clamp(1-s,0,2);if(up>.1)for(let i=0;i<2;i++)h+=arrow(xe-8-i*10,BOT-8,xe-8-i*10,SS+4,"#9fe0ff",.6+up*.6,3.5);
  h+=T(xe-2,SS-14,"Peru",'text-anchor="end" font-size="5.8" font-weight="800" fill="'+INK+'"')+T(xw+2,SS-14,"Indonesia",'font-size="5.8" font-weight="800" fill="'+INK+'"');
  setHTML(svg,".ni-x",h);
  const a=sst(-145,0,s)-sst(-145,0,0);
  txt(svg,".ni-big",(a>=0?"+":"−")+Math.abs(a).toFixed(1)+" °C in the Niño 3.4 box · "+(a>=2?"very strong El Niño, like 1997–98":a>=1.5?"strong El Niño":a>=.5?"El Niño":a<=-1.5?"strong La Niña, like 2010–11":a<=-.5?"La Niña":"neutral"));
  setPara(svg,"ni-tx",s>.2?"Trade winds weaken, warm water slides east and the rain follows it: floods in Peru and Ecuador, drought in Indonesia and Australia, fewer fish off Peru.":s<-.2?"Stronger trade winds pile warm water in the west: heavy rain in Indonesia and Australia, a colder sea and drought from Peru to the southern USA.":"Trade winds push warm surface water west; off Peru cold water wells up, full of nutrients and fish.");
  setSlider(svg,"s",14,214,276,(s+1)/2,s>.2?"El Niño":s<-.2?"La Niña":"neutral")},
 drag:(svg,st,n,x)=>{st.s=clamp((x-14)/276,0,1)*2-1}});
})();

/* ---------------------------------------------------------------- the urban heat island */
(function(){
const rural=h=>15+7*Math.sin(2*Math.PI*(h-9)/24);/* a summer day in the countryside */
/* how strong the heat island is at each hour: weak by day, strongest a few hours after sunset */
const night=h=>{const t=((h-23)%24+24)%24;return .25+.75*Math.exp(-Math.pow(Math.min(t,24-t)/5.5,2))};
/* how urban each place on the line is (0 country, 1 city centre); a park makes a dip */
const urb=x=>{const c=Math.exp(-Math.pow((x-150)/58,2)),park=.75*Math.exp(-Math.pow((x-212)/10,2));return clamp(c*1.05-park,0,1)};
const CX0=26,CX1=294;
mk("sluhi",{title:"The urban heat island",cat:"people",h:216,
 src:"US EPA (Heat Island Effect): cities average about 0.5–4 °C warmer by day and 1–3 °C at night; on calm, clear nights a big city centre can be 7 °C or more warmer than the countryside (Met Office, London). Trees and cool roofs can take off 1–2 °C. Curves are a model.",
 frame:()=>{let h='<rect x="'+CX0+'" y="8" width="'+(CX1-CX0)+'" height="76" fill="#f3f6fa"/><g class="uh-c"></g>';
  /* the skyline: farms, suburbs, towers, a park */
  h+='<rect x="6" y="92" width="288" height="56" rx="6" fill="#cfe6f7"/><rect x="6" y="136" width="288" height="12" fill="#8fb36a"/>';
  for(let x=10;x<294;x+=6){const u=urb(x);if(u<.12){h+='<path d="M'+x+',136 v-4" stroke="#5a4a2a" stroke-width=".8"/><circle cx="'+x+'" cy="'+(130-rnd(x)*2)+'" r="'+f1(2.2+rnd(x*3)*1.4)+'" fill="#4f8a3a"/>';continue}
   if(x>200&&x<224){h+='<circle cx="'+x+'" cy="'+(128-rnd(x)*3)+'" r="4" fill="#3f7a3a"/>';continue}
   const ht=u>.75?18+rnd(x*7)*34:u>.35?8+rnd(x*5)*10:4+rnd(x)*4,w=u>.75?5.2:5,c=u>.75?["#7f8fa3","#5f6f86","#93a2b4"][x%3]:"#d9cbb4";
   h+='<rect x="'+x+'" y="'+f1(136-ht)+'" width="'+w+'" height="'+f1(ht)+'" fill="'+c+'" stroke="#55606e" stroke-width=".3"/>';if(u<=.75)h+='<path d="M'+(x-.5)+','+f1(136-ht)+' l3,-3 l3,3Z" fill="#a8543c"/>';else for(let wy=136-ht+3;wy<134;wy+=4)h+='<rect x="'+(x+1)+'" y="'+f1(wy)+'" width="3" height="1.4" fill="#e8f0f8" opacity=".7" class="uh-win"/>'}
  h+='<rect x="200" y="132" width="24" height="4" rx="2" fill="#5aa0d8"/>'+T(212,146,"park",'text-anchor="middle" font-size="5.8" font-weight="800" fill="#fff"')+T(150,146,"city centre",'text-anchor="middle" font-size="5.8" font-weight="800" fill="#fff"')+T(30,146,"countryside",'text-anchor="middle" font-size="5.8" font-weight="800" fill="#fff"')+T(92,146,"suburbs",'text-anchor="middle" font-size="5.8" font-weight="800" fill="#fff"');
  h+='<rect class="uh-dark" x="6" y="92" width="288" height="44" rx="6" fill="#0d1838" opacity="0"/>';
  h+='<text class="uh-big" x="8" y="160" font-size="8.4" font-weight="900" fill="'+INK+'"></text><text class="uh-sub" x="8" y="170" font-size="6.4" font-weight="700" fill="'+SUB+'"></text>'+slider("h",14,192,140,"Time of day")+btn("wind",162,184,64,"Calm, clear")+btn("green",230,184,64,"Add trees")+hint(8,212,"Drag the time: the city stays warm long after sunset");
  return h},
 state:()=>({h:23,wind:0,green:0}),
 draw:(svg,s)=>{const h=s.h,TR=rural(h),A=7*night(h)*(s.wind?.3:1)*(s.green?.72:1);const yT=v=>84-(v-4)/30*76;let c="";
  for(let v=5;v<=30;v+=5)c+='<path d="M'+CX0+','+f1(yT(v))+'H'+CX1+'" stroke="#d6dee8" stroke-width=".5"/>'+T(CX0-3,f1(yT(v)+2),v+"°",'text-anchor="end" font-size="5.4" fill="'+SUB+'"');
  const pts=[],base=[];for(let x=CX0;x<=CX1;x+=3){pts.push([x,yT(TR+A*urb(x))]);base.push([x,yT(TR)])}
  c+='<path d="'+ln(pts)+'L'+ln(base.slice().reverse()).slice(1)+'Z" fill="#e8701a" opacity=".22"/><path d="'+ln(base)+'" fill="none" stroke="#5b8a3a" stroke-width="1" stroke-dasharray="3 2"/><path d="'+ln(pts)+'" fill="none" stroke="#d2452b" stroke-width="1.6"/>';
  c+=T(CX1-2,f1(yT(TR)+8),"countryside "+Math.round(TR)+" °C",'text-anchor="end" font-size="5.8" font-weight="800" fill="#4a7a2a"')+T(150,f1(yT(TR+A)-4),"centre "+Math.round(TR+A)+" °C",'text-anchor="middle" font-size="6.4" font-weight="900" fill="#b5301c"');
  setHTML(svg,".uh-c",c);const dk=q(svg,".uh-dark"),nt=h<6||h>20.5;if(dk)dk.setAttribute("opacity",nt?".45":"0");svg.querySelectorAll(".uh-win").forEach(w=>{w.style.fill=nt?"#ffd76a":"#e8f0f8"});
  txt(svg,".uh-big","The centre is "+A.toFixed(1)+" °C warmer than the countryside");
  /* with both buttons on, the line ran off the right edge: the extra notes now replace the long cause */
  txt(svg,".uh-sub",s.wind||s.green?(nt?"Night":"Day")+": "+[s.wind?"wind mixes in cooler country air":"",s.green?"trees shade and cool the streets":""].filter(Boolean).join("; "):(nt?"Night: concrete and brick give back the heat they soaked up by day":"Day: dark roofs and roads soak up sunlight, little shade, few plants"));
  const hh=Math.floor(h),mm=Math.round((h-hh)*60)%60;setSlider(svg,"h",14,192,140,h/24,String(hh).padStart(2,"0")+":"+String(mm).padStart(2,"0"));
  btnOn(svg,"wind",!!s.wind,s.wind?"Windy, cloudy":"Calm, clear");btnOn(svg,"green",!!s.green,s.green?"Trees added":"Add trees")},
 drag:(svg,s,n,x)=>{s.h=clamp((x-14)/140,0,.999)*24},
 act:(svg,s,a)=>{if(a==="wind"){s.wind=!s.wind;return true}if(a==="green"){s.green=!s.green;return true}}});
})();

/* ---------------------------------------------------------------- the carbon cycle */
(function(){
/* Global Carbon Budget 2024 (Friedlingstein et al.): 2014–2023 averages, billion tonnes of carbon (GtC) a year:
   fossil 9.7, land use 1.1; of that the air keeps about 46%, the ocean takes 26%, plants and soils 28%. 1 ppm CO₂ = 2.12 GtC.
   The sea and the plants do not take a fixed share of what we add: they take up carbon because the air holds more CO₂ than
   before industry (about 280 ppm), so their uptake grows with that excess (the "sink rate" of Raupach et al. 2014,
   Biogeosciences 11, 3453). The model was a fixed 46% airborne fraction, so with no fossil fuel at all CO₂ still rose; in
   fact it would start to fall (ZECMIP, MacDougall et al. 2020, Biogeosciences 17, 2987). Uptake is now
   K × (ppm − 280), with K set so that at 425 ppm and today's 10.8 GtC the air keeps 46%; the sea gets 26/54 of it. */
const AF=.46,OF=.26,LF=.28,PPM=2.12,P0=280,K=(1-AF)*10.8/(425-P0);
const sinkOf=ppm=>K*Math.max(0,ppm-P0);
mk("slcarbon",{title:"The carbon cycle: where our CO₂ goes",cat:"climate",h:234,
 src:"Stocks and flows: IPCC AR6 WG1 Figure 5.12 and the Global Carbon Budget 2024 (Friedlingstein et al.), rounded, in billion tonnes of carbon (GtC). Air today about 425 ppm CO₂ (NOAA, 2024).",
 defs:()=>'<linearGradient id="dgCcSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fcdf0"/><stop offset="1" stop-color="#e6f3fb"/></linearGradient><linearGradient id="dgCcSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d8fd1"/><stop offset="1" stop-color="#173f6e"/></linearGradient>'+
  pattern("dgCcSoil",speckle("soil","#6b4a32",["#4f3422","#86603f","#3d2a1c"],420,1.3),20,20),
 frame:()=>{let h='<rect x="6" y="6" width="288" height="146" rx="8" fill="url(#dgCcSky)"/><path d="M6,84 Q60,76 120,82 T170,86 V152 H14 a8,8 0 0 1 -8,-8Z" fill="url(#dgCcSoil)"/><path d="M6,84 Q60,76 120,82 T170,86 V92 Q90,86 6,92Z" fill="#6f9a4a"/>';
  h+='<path d="M170,86 H294 V144 a8,8 0 0 1 -8,8 H170Z" fill="url(#dgCcSea)"/><path d="M170,108 H294" stroke="#fff" stroke-opacity=".3" stroke-dasharray="3 2"/>';
  for(let i=0;i<8;i++){const x=16+i*13;h+='<path d="M'+x+',84 v-9" stroke="#4a3220" stroke-width="1.6"/><circle cx="'+x+'" cy="'+(70-rnd(i)*4)+'" r="'+f1(6+rnd(i*2)*2)+'" fill="#3f7a3a"/>'}
  h+='<path d="M14,128 h60 v6 h-60Z" fill="#1b1b1b" opacity=".85"/><path d="M84,136 q20,-6 40,0 v6 q-20,4 -40,0Z" fill="#2a2a2a"/>'+T(18,124,"coal, oil, gas",'font-size="5.8" font-weight="800" fill="#fff"');
  h+='<rect x="130" y="62" width="14" height="22" fill="#8a8a8a"/><rect x="134" y="50" width="4" height="14" fill="#6a6a6a"/><g class="cc-smoke"></g>';
  h+='<g class="cc-a"></g><g class="cc-st"></g>';
  h+='<text class="cc-big" x="8" y="164" font-size="8.4" font-weight="900" fill="'+INK+'"></text><text class="cc-sub" x="8" y="174" font-size="6.4" font-weight="700" fill="'+SUB+'"></text>'+slider("e",14,196,200,"Fossil fuels burnt each year")+btn("play",226,188,68,"▶ 10 years")+hint(8,214,"Drag the burning: about half the extra carbon stays in the air")+btn("goal",8,219,92,"Goal: stop the rise")+'<text class="cc-gm" x="106" y="229" font-size="6.4" font-weight="800" fill="#b04a14">How much less would we have to burn?</text>';
  return h},
 state:()=>({e:9.7,yr:2025,ppm:425,play:0}),
 draw:(svg,s)=>{const E=s.e+1.1,W=v=>Math.max(.8,Math.sqrt(v)*.75);let a="";const lab=(x,y,t,anc)=>T(x,y,t,'font-size="5.8" font-weight="800" fill="'+INK+'" stroke="#fff" stroke-width="1.8" stroke-opacity=".8" paint-order="stroke"'+(anc?' text-anchor="'+anc+'"':""));
  /* natural flows, roughly in balance */
  a+=arrow(34,30,34,60,"#3f8a3a",W(113),5)+arrow(50,60,50,30,"#8a6a3a",W(111),5)+lab(58,36,"plants take in 113")+lab(58,46,"breathe, rot 111");
  a+=arrow(240,40,240,88,"#2f6ea8",W(80),5)+arrow(256,88,256,40,"#5a8ab8",W(78),5)+lab(248,34,"sea: 80 in, 78 out","middle");
  /* our extra flows */
  const SK=sinkOf(s.ppm),so=SK*OF/(OF+LF),sl=SK*LF/(OF+LF),net=E-SK,r1=v=>Math.round(v*10)/10;
  a+=arrow(137,50,146,25,"#3a3a3a",W(E)*1.4,6)+lab(147,60,"we add "+r1(E));
  if(SK>.2){a+=arrow(184,28,214,96,"#d2452b",W(so)*1.4,5)+T(176,104,"+"+r1(so)+" into the sea",'font-size="5.8" font-weight="800" fill="#fff"')+arrow(122,26,106,70,"#d2452b",W(sl)*1.4,5)+lab(104,78,"+"+r1(sl)+" into plants, soil")}
  setHTML(svg,".cc-a",a);
  let sm="";for(let i=0;i<Math.round(s.e/2);i++)sm+='<circle cx="'+f1(136+i*3+rnd(i)*4)+'" cy="'+f1(46-i*4)+'" r="'+f1(2.5+i*.7)+'" fill="#7a7a7a" opacity="'+f2(.55-i*.06)+'"/>';setHTML(svg,".cc-smoke",sm);
  const box=(x,y,t,v)=>'<g transform="translate('+x+','+y+')"><rect width="58" height="17" rx="5" fill="#fff" opacity=".9"/>'+T(4,7,t,'font-size="5.2" fill="'+SUB+'"')+T(4,14.5,v,'font-size="6.6" font-weight="900" fill="'+INK+'"')+'</g>';
  setHTML(svg,".cc-st",box(118,6,"air",fmt(s.ppm*PPM)+" GtC")+box(10,96,"plants",fmt(450)+" GtC")+box(76,96,"soils",fmt(1700)+" GtC")+box(232,112,"deep ocean","37,000 GtC")+box(232,90,"surface ocean","900 GtC")+box(110,131,"fossil fuels left","~1,000+ GtC").replace('fill="#fff" opacity=".9"','fill="#fff" opacity=".75"'));
  const rate=net/PPM;
  txt(svg,".cc-big",s.yr+": "+Math.round(s.ppm)+" ppm CO₂ · "+(Math.abs(rate)<.05?"holding steady":(rate>0?"rising ":"falling ")+Math.abs(rate).toFixed(1)+" ppm a year"));
  txt(svg,".cc-sub",net>=0?"Of "+r1(E)+" GtC we add each year, the air keeps "+r1(net)+" ("+Math.round(net/E*100)+"%); the sea and plants take the rest":"We add "+r1(E)+" GtC; the sea and plants take "+r1(SK)+", more than we add, so the air loses "+r1(-net));
  const gm=q(svg,".cc-gm");if(gm){if(s.goal2){const ok=Math.abs(rate)<.05,cut=Math.round((1-s.e/9.7)*100);gm.textContent=ok?"Done! "+r1(s.e)+" GtC, "+cut+"% less than now, stops the rise (for a while)":"CO₂ is "+(rate>0?"still rising: burn less":"falling: you can burn a bit more");gm.setAttribute("fill",ok?"#2f7a3a":"#b04a14")}btnOn(svg,"goal",!!s.goal2)}
  setSlider(svg,"e",14,196,200,s.e/20,(Math.round(s.e*10)/10)+" GtC a year");btnOn(svg,"play",!!s.play)},
 drag:(svg,s,n,x)=>{s.e=clamp((x-14)/200,0,1)*20},
 act:(svg,s,a)=>{if(a==="play"){if(!s.play){s.play=1;s.goal=s.yr+10}return true}if(a==="goal"){s.goal2=!s.goal2;s.yr=2025;s.ppm=425;s.play=0;return true}},
 tick:(svg,s,dt)=>{if(!s.play)return;const d=Math.min(dt*3,s.goal-s.yr);s.yr+=d;s.ppm+=d*(s.e+1.1-sinkOf(s.ppm))/PPM;if(s.yr>=s.goal-1e-6){s.yr=Math.round(s.yr);s.play=0}s.yr=Math.round(s.yr*100)/100;DG.slcarbon._d(svg,s)}});
{const D=DG.slcarbon,d=D._d;D._d=(svg,s)=>{const y=s.yr;s.yr=Math.floor(y);d(svg,s);s.yr=y}}
})();

/* ---------------------------------------------------------------- the water cycle: follow a drop */
(function(){
/* flows in thousand km³ a year (Trenberth et al. 2007) and how long water stays in each store (USGS; Pidwirny) */
const ST={ocean:["the ocean","about 3,200 years",[250,128]],air:["the air","about 9 days",[150,26]],ice:["ice and snow","20 to 100,000 years",[64,58]],ground:["underground","weeks to 10,000 years",[96,132]],soil:["the soil","1 to 2 months",[60,104]],river:["a river","2 to 6 months",[140,98]],lake:["a lake","10 to 100 years",[106,96]],plant:["a plant","about a week",[30,86]]};
/* where a drop goes next, with odds from the flows */
const NEXT={ocean:[["air",1]],air:[["ocean",.77],["soil",.12],["ice",.02],["river",.05],["lake",.04]],soil:[["plant",.45],["air",.2],["ground",.2],["river",.15]],plant:[["air",1]],ground:[["river",.5],["ocean",.3],["lake",.2]],river:[["ocean",.85],["lake",.1],["air",.05]],lake:[["river",.6],["air",.4]],ice:[["river",.7],["ground",.3]]};
mk("slwater",{title:"The water cycle: follow a drop",cat:"water",h:216,
 src:"Flows: Trenberth et al. (2007), thousand km³ a year: from the ocean 413 rise and 373 fall back; 40 blow over the land; 113 fall on land, 73 rise again from soil and plants, 40 run back to the sea. Times in each store: USGS and Pidwirny (2006), rounded.",
 defs:()=>'<linearGradient id="dgWcSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc3ec"/><stop offset="1" stop-color="#e6f3fb"/></linearGradient><linearGradient id="dgWcSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d8fd1"/><stop offset="1" stop-color="#173f6e"/></linearGradient>'+pattern("dgWcSoil",speckle("soil2","#8a6a4a",["#6b4f34","#a3825f"],360,1.2),18,18),
 frame:()=>{let h='<rect x="6" y="6" width="288" height="146" rx="8" fill="url(#dgWcSky)"/>';
  h+='<path d="M6,110 L30,92 L64,40 L84,64 L104,58 L130,92 L190,104 L206,112 V152 H14 a8,8 0 0 1 -8,-8Z" fill="url(#dgWcSoil)"/><path d="M6,110 L30,92 L64,40 L84,64 L104,58 L130,92 L190,104 L206,112" fill="none" stroke="#6f9a4a" stroke-width="3"/><path d="M56,52 L64,40 L74,52 L68,50 L64,54 L60,50Z" fill="#fff"/>';
  h+='<path d="M200,112 H294 V144 a8,8 0 0 1 -8,8 H200Z" fill="url(#dgWcSea)"/><path d="M98,92 q8,-3 16,0" stroke="#3d8fd1" stroke-width="5" stroke-linecap="round"/><path d="M104,94 C130,100 160,102 202,112" fill="none" stroke="#3d8fd1" stroke-width="2.4"/>';
  h+='<path d="M14,124 H190 V134 H14Z" fill="#3d8fd1" opacity=".22"/>'+T(16,132,"groundwater",'font-size="5.6" font-weight="800" fill="#173f6e"');
  for(let i=0;i<4;i++){const x=24+i*9;h+='<path d="M'+x+',100 v-8" stroke="#4a3220" stroke-width="1.2"/><circle cx="'+x+'" cy="'+(88-rnd(i)*3)+'" r="4.4" fill="#3f7a3a"/>'}
  h+='<g transform="translate(120,14)"><circle cx="0" cy="8" r="9" fill="#fff"/><circle cx="12" cy="4" r="11" fill="#fff"/><circle cx="26" cy="9" r="8" fill="#fff"/><rect x="-6" y="8" width="38" height="8" fill="#fff"/></g>';
  const lab=(x,y,t,c)=>T(x,y,t,'font-size="5.8" font-weight="800" fill="'+(c||INK)+'" stroke="#fff" stroke-width="1.8" stroke-opacity=".75" paint-order="stroke"');
  h+=arrow(240,104,240,44,"#5a9ad0",4,6)+lab(244,72,"413 rise")+arrow(272,40,272,104,"#2f6ea8",3.7,6)+lab(250,36,"373 fall")+arrow(220,30,170,30,"#7aa6cc",1.6,5)+lab(176,24,"40 blow inland")+arrow(150,40,150,84,"#2f6ea8",2.2,5)+lab(154,64,"113 fall")+arrow(40,80,52,30,"#7fb070",1.8,5)+lab(22,26,"73 rise")+lab(160,96,"40 run off",'#173f6e');
  h+='<g class="wc-d"></g><text class="wc-big" x="8" y="164" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("wc-tx",8,167,212,30,6.3)+btn("next",226,160,68,"Next hop →")+btn("reset",226,180,68,"Start again")+hint(8,212,"Press Next hop: where the drop goes is picked with the real odds");
  return h},
 state:()=>({at:"ocean",log:["ocean"],yrs:0,n:0}),
 draw:(svg,s)=>{const p=ST[s.at][2];setHTML(svg,".wc-d",'<g transform="translate('+p[0]+','+p[1]+')"><circle r="9" fill="#fff" opacity=".55"/><path d="M0,-6 C3,-2 5,1 5,3 A5,5 0 0 1 -5,3 C-5,1 -3,-2 0,-6Z" fill="#1d6fd0" stroke="#fff" stroke-width=".8"/></g>');
  txt(svg,".wc-big","The drop is in "+ST[s.at][0]+" · stays "+ST[s.at][1]);
  setPara(svg,"wc-tx","Its trip so far: "+s.log.slice(-8).map(k=>ST[k][0].replace(/^(the|a) /,"")).join(" → ")+(s.log.length>8?" …":"")+". Most water in the cycle is in the ocean (97%); a drop in the air comes down within about 9 days.")},
 act:(svg,s,a)=>{if(a==="reset"){s.at="ocean";s.log=["ocean"];return true}if(a==="next"){const L=NEXT[s.at];let r=Math.random(),k=L[0][0];for(const [n,pr] of L){if((r-=pr)<=0){k=n;break}k=n}s.at=k;s.log.push(k);return true}}});
})();

/* contour lines on a grid (marching squares): returns path data for value v; z[j][i], cell size 1, mapped by fx(i), fy(j) */
function contourPath(z,v,fx,fy){const H=z.length,W=z[0].length;let d="";const lp=(a,b,ia,ja,ib,jb)=>{const t=(v-a)/(b-a);return[fx(ia+(ib-ia)*t),fy(ja+(jb-ja)*t)]};
 for(let j=0;j<H-1;j++)for(let i=0;i<W-1;i++){const a=z[j][i],b=z[j][i+1],c=z[j+1][i+1],e=z[j+1][i];const k=(a>v?8:0)|(b>v?4:0)|(c>v?2:0)|(e>v?1:0);if(k===0||k===15)continue;
  const T0=()=>lp(a,b,i,j,i+1,j),R0=()=>lp(b,c,i+1,j,i+1,j+1),B0=()=>lp(e,c,i,j+1,i+1,j+1),L0=()=>lp(a,e,i,j,i,j+1);
  const seg=(p,q)=>{d+="M"+f1(p[0])+","+f1(p[1])+"L"+f1(q[0])+","+f1(q[1])};
  switch(k){case 1:case 14:seg(L0(),B0());break;case 2:case 13:seg(B0(),R0());break;case 3:case 12:seg(L0(),R0());break;case 4:case 11:seg(T0(),R0());break;
   case 5:seg(L0(),T0());seg(B0(),R0());break;case 6:case 9:seg(T0(),B0());break;case 7:case 8:seg(L0(),T0());break;case 10:seg(T0(),R0());seg(L0(),B0());break}}return d}
K.contourPath=contourPath;

/* ---------------------------------------------------------------- latitude and longitude on a globe */
(function(){
const GX=84,GY=88,GR=74;
const CITIES=[["London",-.13,51.5],["Paris",2.35,48.86],["Cairo",31.24,30.04],["Lagos",3.38,6.52],["Nairobi",36.82,-1.29],["Cape Town",18.42,-33.92],["Mumbai",72.88,19.08],["Delhi",77.21,28.61],["Beijing",116.4,39.9],["Tokyo",139.69,35.69],["Singapore",103.82,1.35],["Sydney",151.21,-33.87],
 ["Auckland",174.76,-36.85],["Honolulu",-157.86,21.31],["Los Angeles",-118.24,34.05],["Mexico City",-99.13,19.43],["New York",-74,40.71],["Lima",-77.03,-12.05],["São Paulo",-46.63,-23.55],["Buenos Aires",-58.38,-34.6],["Reykjavík",-21.94,64.15],["Moscow",37.62,55.76],["Anchorage",-149.9,61.22],["Quito",-78.47,-.18],["Jakarta",106.85,-6.21],["Istanbul",28.98,41.01],["Tehran",51.39,35.69],["Johannesburg",28.05,-26.2],["Santiago",-70.67,-33.45],["McMurdo (Antarctica)",166.67,-77.85]];
const dist=(a,b)=>{const R=Math.PI/180,x=Math.sin((b[1]-a[1])*R/2),y=Math.sin((b[0]-a[0])*R/2);return 2*6371*Math.asin(Math.sqrt(x*x+Math.cos(a[1]*R)*Math.cos(b[1]*R)*y*y))};
const dms=(v,p,n)=>{const a=Math.abs(v),d=Math.floor(a),m=Math.round((a-d)*60);return(m===60?d+1:d)+"°"+String(m===60?0:m).padStart(2,"0")+"′ "+(v>=0?p:n)};
let PG=null;const proj=r=>{if(!PG)PG=d3.geoOrthographic().scale(GR).translate([GX,GY]).clipAngle(90);PG.rotate(r);return PG};
/* A "find it" challenge: you are given a city's latitude and longitude only, steer the pin there and check how close you
   came (great-circle distance). The nearest-place readout is hidden meanwhile, so it cannot give the answer away. */
mk("sllatlon",{title:"Latitude and longitude: an address for anywhere",cat:"maps",h:224,
 src:"Coordinates on the WGS 84 globe. One degree of latitude is about 111 km; a degree of longitude is 111 km × cos(latitude), so 0 km at the poles. Distances along great circles.",
 defs:()=>'<radialGradient id="dgLlSea" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#5aa5dc"/><stop offset="1" stop-color="#1d4f86"/></radialGradient><radialGradient id="dgLlShade" cx=".36" cy=".32" r=".8"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#001226" stop-opacity=".4"/></radialGradient>',
 frame:()=>'<circle cx="'+GX+'" cy="'+GY+'" r="'+(GR+6)+'" fill="#e6eef6"/><g class="ll-g"></g><circle cx="'+GX+'" cy="'+GY+'" r="'+GR+'" fill="transparent" data-drag="rot"/><g class="ll-pin"></g>'+
  '<g transform="translate(170,8)"><rect width="124" height="164" rx="9" fill="#fff"/><g class="ll-p"></g></g>'+hint(8,188,"Drag the pin to read its address; drag the globe to turn it")+T(8,200,"Latitude: north or south of the Equator. Longitude: east or west of Greenwich.",'font-size="5.8" fill="'+SUB+'"')+btn("find",8,206,84,"Challenge: find it")+'<text class="ll-fm" x="98" y="216" font-size="6.6" font-weight="800" fill="#b04a14">Find a city from its address alone</text>',
 state:()=>({r:[10,-30,0],pin:[-.13,51.5]}),
 draw:(svg,s)=>{const P=proj(s.r),pa=d3.geoPath(P),L=landThin(.8);let h='<circle cx="'+GX+'" cy="'+GY+'" r="'+GR+'" fill="url(#'+uid(svg,"dgLlSea")+')"/>';
  if(L){let d="";L.forEach(o=>{const t=pa({type:"Polygon",coordinates:o.rings});if(t)d+=t});h+='<path d="'+d.replace(/(\.\d)\d+/g,"$1")+'" fill="#a9c47e" stroke="#6f8f55" stroke-width=".3"/>'}
  h+='<path d="'+pa(d3.geoGraticule().step([15,15])())+'" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".5"/>';
  const line=(c,col,w,da)=>{const t=pa({type:"LineString",coordinates:c});return t?'<path d="'+t+'" fill="none" stroke="'+col+'" stroke-width="'+w+'"'+(da?' stroke-dasharray="'+da+'"':"")+'/>':""};
  const par=l=>{const c=[];for(let x=-180;x<=180;x+=3)c.push([x,l]);return c},mer=l=>{const c=[];for(let y=-90;y<=90;y+=3)c.push([l,y]);return c};
  h+=line(par(0),"#ff6a4a",1.3)+line(mer(0),"#ffd24a",1.3)+line(par(s.pin[1]),ACC,1.1,"3 2")+line(mer(s.pin[0]),ACC,1.1,"3 2");
  h+='<circle cx="'+GX+'" cy="'+GY+'" r="'+GR+'" fill="url(#'+uid(svg,"dgLlShade")+')" pointer-events="none"/>';
  const eq=P([s.r[0]?-s.r[0]+40:40,0]);if(eq&&d3.geoDistance([-s.r[0]+40,0],[-s.r[0],-s.r[1]])<1.4)h+=T(f1(eq[0]),f1(eq[1]-3),"Equator 0°",'font-size="6" font-weight="900" fill="#ffd8d0"');
  const pm=[0,25],pp=P(pm);if(pp&&d3.geoDistance(pm,[-s.r[0],-s.r[1]])<1.4)h+=T(f1(pp[0]+3),f1(pp[1]),"Greenwich 0°",'font-size="6" font-weight="900" fill="#fff1b0"');
  setHTML(svg,".ll-g",h);
  const q2=P(s.pin),vis=d3.geoDistance(s.pin,[-s.r[0],-s.r[1]])<Math.PI/2;
  setHTML(svg,".ll-pin",vis&&q2?'<g class="dg-handle" data-drag="pin" transform="translate('+f1(q2[0])+','+f1(q2[1])+')"><circle r="12" fill="transparent"/><path d="M0,0 C-5,-7 -5,-13 0,-13 C5,-13 5,-7 0,0Z" fill="'+ACC+'" stroke="#fff" stroke-width=".9"/><circle cy="-9" r="2" fill="#fff"/></g>':"");
  if(s.find&&s.find.done){const C=CITIES[s.find.i],tg=[C[1],C[2]],tp=P(tg);if(tp&&d3.geoDistance(tg,[-s.r[0],-s.r[1]])<Math.PI/2){const g=q(svg,".ll-pin");if(g)g.insertAdjacentHTML("afterbegin",'<circle cx="'+f1(tp[0])+'" cy="'+f1(tp[1])+'" r="3.4" fill="#2f9a5a" stroke="#fff" stroke-width="1.2"/>'+T(f1(tp[0]+5),f1(tp[1]+2),C[0],'font-size="6.4" font-weight="900" fill="#fff" stroke="#14532d" stroke-width="1.8" paint-order="stroke"'))}}
  const near=CITIES.map(c=>[c,dist(s.pin,[c[1],c[2]])]).sort((a,b)=>a[1]-b[1])[0];
  let p=T(8,15,"Latitude",'font-size="6.2" fill="'+SUB+'"')+T(8,28,dms(s.pin[1],"N","S"),'font-size="11" font-weight="900" fill="'+INK+'"')+T(8,37,s.pin[1].toFixed(2)+"°",'font-size="6" fill="'+SUB+'"');
  p+=T(8,52,"Longitude",'font-size="6.2" fill="'+SUB+'"')+T(8,65,dms(s.pin[0],"E","W"),'font-size="11" font-weight="900" fill="'+INK+'"')+T(8,74,s.pin[0].toFixed(2)+"°",'font-size="6" fill="'+SUB+'"');
  p+='<path d="M8,82h108" stroke="#e1e7ef"/>'+T(8,93,"1° of latitude ≈ 111 km",'font-size="6" font-weight="700" fill="'+INK+'"')+T(8,103,"1° of longitude here ≈ "+fmt(111.32*Math.cos(s.pin[1]*R))+" km",'font-size="6" font-weight="700" fill="'+INK+'"');
  const F=s.find,hideNear=F&&!F.done;
  p+=T(8,118,"Nearest big place",'font-size="6" fill="'+SUB+'"')+T(8,129,hideNear?"? (hidden)":near[0][0],'font-size="8" font-weight="900" fill="'+INK+'"')+T(8,138,hideNear?"until you check":fmt(near[1])+" km away",'font-size="6" fill="'+SUB+'"');
  const fm=q(svg,".ll-fm");if(fm){if(F){const C=CITIES[F.i];if(F.done){const d=F.d;fm.textContent=(d<300?"Spot on! ":d<1000?"Close! ":"")+"That was "+C[0]+": you were "+fmt(d)+" km away"+(F.n>1?" · "+F.ok+" of "+F.n+" within 1,000 km":"");fm.setAttribute("fill",d<1000?"#2f7a3a":"#b04a14")}else{fm.textContent="Put the pin on "+dms(C[2],"N","S")+", "+dms(C[1],"E","W")+" (turn the globe), then Check";fm.setAttribute("fill","#b04a14")}}}
  btnOn(svg,"find",!!(F&&!F.done),F?(F.done?"Next place":"Check"):"Challenge: find it");
  p+=T(8,153,Math.abs(s.pin[1])<.5?"On the Equator":s.pin[1]>66.56?"Inside the Arctic Circle":s.pin[1]<-66.56?"Inside the Antarctic Circle":Math.abs(s.pin[1])<23.44?"In the tropics":(s.pin[1]>0?"Northern":"Southern")+" hemisphere",'font-size="6.2" font-weight="800" fill="'+ACC+'"');
  setHTML(svg,".ll-p",p)},
 act:(svg,s,a)=>{if(a!=="find")return false;const F=s.find;
  if(F&&!F.done){F.d=dist(s.pin,[CITIES[F.i][1],CITIES[F.i][2]]);F.done=1;F.n++;if(F.d<1000)F.ok++;const C=CITIES[F.i];s.r=[-C[1],-clamp(C[2],-60,60),0];return true}
  let i;do{i=Math.floor(Math.random()*(CITIES.length-1))}while(F&&i===F.i);s.find={i,done:0,n:F?F.n:0,ok:F?F.ok:0};return true},
 drag:(svg,s,n,x,y)=>{const now=performance.now();const fresh=!s._t||now-s._t>140;s._t=now;
  if(n==="pin"){const P=proj(s.r),dx=x-GX,dy=y-GY,r=Math.hypot(dx,dy),k=r>GR*.98?GR*.98/r:1;const ll=P.invert([GX+dx*k,GY+dy*k]);if(ll&&isFinite(ll[0]))s.pin=[ll[0],ll[1]];return}
  if(fresh){s._p=[x,y];return}const dx=x-s._p[0],dy=y-s._p[1];s._p=[x,y];s.r=[s.r[0]+dx*.6,clamp(s.r[1]-dy*.6,-90,90),0]}});
})();

/* ---------------------------------------------------------------- map projections and Tissot's circles */
(function(){
const PJ=[["Mercator",()=>d3.geoMercator(),"Keeps shapes and angles; areas swell towards the poles (Greenland looks as big as Africa, but is 14 times smaller)."],
 ["Robinson",()=>d3.geoRobinson(),"A compromise: nothing exact, nothing badly wrong. Used for many wall maps (National Geographic 1988–98)."],
 ["Equal Earth",()=>d3.geoEqualEarth(),"Every area is true to size; shapes stretch a little near the edges (Šavrič, Patterson and Jenny, 2018)."],
 ["Gall–Peters",()=>d3.geoCylindricalEqualArea().parallel(45),"Equal area too, but shapes near the Equator are stretched tall and those near the poles squashed flat."],
 ["Polar",()=>d3.geoAzimuthalEquidistant().rotate([0,-90]).clipAngle(150),"Distances from the North Pole are true; everything else stretches the further south it lies (like the UN emblem)."]];
const BOX=[[8,26],[292,146]];const CP={};
function proj(i){if(CP[i])return CP[i];const p=PJ[i][1]();if(i===0){p.fitExtent(BOX,{type:"MultiPoint",coordinates:[[-180,-80],[180,84]]});p.clipExtent(BOX)}else p.fitExtent(BOX,{type:"Sphere"});CP[i]=p;return p}
/* area of a small circle on the map compared with the same circle at the Equator (or at the projection's centre) */
const capArea=(P,ll)=>{const pa=d3.geoPath(P);return pa.area(d3.geoCircle().center(ll).radius(2).precision(10)())};
mk("sltissot",{title:"Five world maps, one circle",cat:"maps",h:212,tabs:PJ.map(p=>p[0]),tabFrames:1,
 src:"Real coastlines (the map’s own Natural Earth shapes) drawn with d3-geo projections. Circles are Tissot’s indicatrices: the same 1,000-km circle placed every 30°. Mercator cut off at 80° S and 84° N.",
 frame:tab=>{const P=proj(tab),pa=d3.geoPath(P);let h='<path d="'+(pa({type:"Sphere"})||"")+'" fill="#d7e8f5" stroke="#9fb2c4" stroke-width=".6"/>';
  h+='<path d="'+landPath("tis"+tab,P)+'" fill="#c9c09a" stroke="#8e8462" stroke-width=".3"/><path d="'+(pa(d3.geoGraticule().step([30,30])())||"").replace(/(\.\d)\d+/g,"$1")+'" fill="none" stroke="#fff" stroke-width=".5"/>';
  let t="";for(let lat=-60;lat<=60;lat+=30)for(let lon=-150;lon<=180;lon+=30){if(tab===4&&lat<-30)continue;const c=pa(d3.geoCircle().center([lon,lat]).radius(4.5).precision(8)());if(c)t+=c}
  h+='<path d="'+t.replace(/(\.\d)\d+/g,"$1")+'" fill="#d2452b" fill-opacity=".35" stroke="#b5301c" stroke-width=".5"/>';
  if(tab!==4){[80,84].forEach(()=>{})}
  h+='<g class="ts-c"></g><text class="ts-big" x="8" y="160" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("ts-tx",8,163,286,24,6.3)+hint(8,206,"Drag the blue circle north and south: watch it grow or keep its size");
  return h},
 state:()=>({ll:[20,0]}),
 draw:(svg,s)=>{const P=proj(s.tab),pa=d3.geoPath(P);const c=pa(d3.geoCircle().center(s.ll).radius(9).precision(5)());
  const ref=s.tab===4?capArea(P,[0,90-1e-6])||1:capArea(P,[s.ll[0],0]),k=capArea(P,s.ll)/ref,ce=P(s.ll);
  setHTML(svg,".ts-c",c&&ce?'<path d="'+c+'" fill="#2f78b8" fill-opacity=".45" stroke="#1d4f86" stroke-width="1"/><g class="dg-handle" data-drag="c" transform="translate('+f1(ce[0])+','+f1(ce[1])+')"><circle r="12" fill="transparent"/><circle r="3" fill="#fff" stroke="#1d4f86" stroke-width="1.2"/></g>':"");
  const lat=Math.round(s.ll[1]);txt(svg,".ts-big","At "+Math.abs(lat)+"°"+(lat>=0?"N":"S")+": the circle is drawn "+(Math.abs(k-1)<.04?"at its true size":k>1?(k<10?k.toFixed(1):Math.round(k))+"× too big":(1/k).toFixed(1)+"× too small")+(s.tab===4?" (compared with the pole)":""));
  setPara(svg,"ts-tx",PJ[s.tab][2])},
 drag:(svg,s,n,x,y)=>{const P=proj(s.tab),ll=P.invert([x,y]);if(ll&&isFinite(ll[0])&&isFinite(ll[1]))s.ll=[ll[0],clamp(ll[1],s.tab===4?-50:-78,82)]}});
/* the polar map is clipped 60° south of the Equator, so a circle dragged further south vanished and the readout said
   "Infinity× too small"; on that map the circle now stops at 50° S (its 9° radius stays inside the map) */
{const D=DG.sltissot,a0=D.act;D.act=(svg,a)=>{const s=svg._s,r=a0(svg,a);if(s&&s.tab===4&&s.ll[1]<-50){s.ll=[s.ll[0],-50];D._d(svg,s)}return r}}
})();

/* ---------------------------------------------------------------- the Sun, the clock and time zones */
(function(){
const MX0=6,MY0=6,MW=288,MH=144;
const CITIES=[["Kashgar",76,39.5,8],["Beijing",116.4,39.9,8],["Madrid",-3.7,40.4,1],["London",-.13,51.5,0],["Reykjavík",-21.9,64.1,0],["New York",-74,40.7,-5],["Mumbai",72.9,19.1,5.5],["Anchorage",-149.9,61.2,-9],["Sydney",151.2,-33.9,10],["Lima",-77,-12,-5]];
let PE=null;const proj=()=>PE||(PE=d3.geoEquirectangular().fitExtent([[MX0,MY0],[MX0+MW,MY0+MH]],{type:"Sphere"}));
const hm=v=>{v=((v%24)+24)%24;const m=Math.round(v*60)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")};
/* the equation of time in minutes (Spencer 1971, rounded) */
const eot=n=>{const g=2*Math.PI/365*(n-1);return 229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g))};
mk("slsuntime",{title:"The Sun, the clock and time zones",cat:"earth",h:225,
 src:"Sun position from the date and UTC (declination 23.44° × sin of the date; equation of time after Spencer 1971). Clock times are each place’s standard time without summer time. China uses one time zone, UTC+8, from Kashgar to Shanghai.",
 defs:()=>'<linearGradient id="dgStSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb6e0"/><stop offset="1" stop-color="#4f8fc4"/></linearGradient>',
 frame:()=>{const P=proj(),pa=d3.geoPath(P);let h='<path d="'+pa({type:"Sphere"})+'" fill="url(#dgStSea)"/><path d="'+landPath("st",P)+'" fill="#d9cfa4" stroke="#9a8f68" stroke-width=".3"/>';
  for(let l=-180;l<=180;l+=15){const x=P([l,0])[0];h+='<path d="M'+f1(x)+','+MY0+'V'+(MY0+MH)+'" stroke="#fff" stroke-opacity=".3" stroke-width=".4"/>';if(l>-180&&l<180&&l%30===0)h+=T(f1(x),MY0+MH+7,(l/15>0?"+":"")+(l/15)+"h",'text-anchor="middle" font-size="5.2" fill="'+SUB+'"')}
  /* the map-wide drag area was drawn over the cities, so "tap a city" never reached them; it now sits under them */
  h+='<g class="st-n"></g><rect x="'+MX0+'" y="'+MY0+'" width="'+MW+'" height="'+MH+'" fill="transparent" data-drag="sun"/><g class="st-c"></g><g class="st-s"></g>';
  h+=T(MX0,MY0+MH+7,"sun time vs Greenwich:",'font-size="5.2" fill="'+SUB+'"').replace('x="6"','x="6" text-anchor="start"').replace("sun time vs Greenwich:","");
  h+='<text class="st-big" x="8" y="170" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("st-tx",8,173,286,24,6.3)+slider("d",14,205,276,"Date")+hint(8,220,"Drag the Sun across the map; tap a city to compare its clock with the Sun");
  return h},
 state:()=>({utc:6,n:172,city:0}),
 draw:(svg,s)=>{const P=proj(),pa=d3.geoPath(P),dec=23.44*Math.sin(2*Math.PI*(284+s.n)/365),E=eot(s.n)/60;const sl=-(s.utc+E-12)*15,sun=[((sl+540)%360)-180,dec],anti=[sun[0]+180,-dec];
  setHTML(svg,".st-n",'<path d="'+pa(d3.geoCircle().center(anti).radius(96)())+'" fill="#0d1838" opacity=".22"/><path d="'+pa(d3.geoCircle().center(anti).radius(90)())+'" fill="#0d1838" opacity=".38"/>');
  const sp=P(sun);let c="";
  CITIES.forEach(([n,lon,lat,z],i)=>{const p=P([lon,lat]),on=i===s.city;c+='<g data-act="city:'+i+'" style="cursor:pointer"><circle cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r="'+(on?3.4:2.3)+'" fill="'+(on?ACC:"#fff")+'" stroke="#1d3047" stroke-width=".8"/>'+(on||i<4?T(f1(p[0]+4),f1(p[1]-3),n,'font-size="5.8" font-weight="800" fill="'+INK+'" stroke="#fff" stroke-width="1.6" stroke-opacity=".8" paint-order="stroke"'):"")+'<circle cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r="9" fill="transparent"/></g>'});
  setHTML(svg,".st-c",c);
  setHTML(svg,".st-s",'<path d="M'+f1(sp[0])+','+MY0+'V'+(MY0+MH)+'" stroke="#ffd24a" stroke-width="1.2" stroke-dasharray="3 2"/>'+T(f1(sp[0]+3),MY0+9,"noon here",'font-size="5.6" font-weight="900" fill="#7a5a00" stroke="#fff" stroke-width="1.6" paint-order="stroke"')+'<g class="dg-handle" data-drag="sun" transform="translate('+f1(sp[0])+','+f1(sp[1])+')"><circle r="13" fill="transparent"/><circle r="9" fill="#ffd24a" opacity=".35"/><circle r="5.4" fill="#ffd24a" stroke="#e8a000" stroke-width="1"/></g>');
  const C=CITIES[s.city],clock=s.utc+C[3],sunT=s.utc+C[1]/15+E,diff=clock-sunT;
  txt(svg,".st-big",C[0]+": the clock says "+hm(clock)+", the Sun says "+hm(sunT));
  setPara(svg,"st-tx",Math.abs(diff)<.25?"Clock and Sun agree within a quarter of an hour: this place is near the middle of its time zone.":"The clock runs "+Math.floor(Math.round(Math.abs(diff)*60)/60)+" h "+(Math.round(Math.abs(diff)*60)%60)+" min "+(diff>0?"ahead of":"behind")+" the Sun"+(C[0]==="Kashgar"?": all of China keeps Beijing time, so in the far west the Sun is highest mid-afternoon.":C[0]==="Madrid"?": Spain keeps Central European Time although it lies as far west as Britain.":". Tap another city."));
  const d=new Date(Date.UTC(2025,0,1)+s.n*864e5);setSlider(svg,"d",14,205,276,s.n/365,d.getUTCDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()]+" · "+hm(s.utc)+" UTC")},
 drag:(svg,s,n,x,y)=>{if(n==="d"){s.n=clamp((x-14)/276,0,1)*364;return}if(y>MY0+MH+4)return false;const ll=proj().invert([x,y]);if(!ll)return false;s.utc=((12-ll[0]/15-eot(s.n)/60)%24+24)%24},
 act:(svg,s,a)=>{const m=/^city:(\d+)/.exec(a);if(m){s.city=+m[1];return true}}});
})();

/* ---------------------------------------------------------------- wind from pressure differences */
(function(){
const MX0=6,MY0=6,MX1=294,MY1=140,GW=58,GH=28;let PM=null;
const proj=()=>PM||(PM=d3.geoMercator().fitExtent([[MX0,MY0],[MX1,MY1]],{type:"MultiPoint",coordinates:[[-42,36],[32,68]]}));
const RHO=1.2,OMEGA=7.292e-5;
/* pressure (hPa) from a high and a low, each a smooth bell about 900 km wide */
function field(s){const z=[];for(let j=0;j<=GH;j++){const row=[];for(let i=0;i<=GW;i++){const x=MX0+i/GW*(MX1-MX0),y=MY0+j/GH*(MY1-MY0);
 const g=(c,w)=>Math.exp(-((x-c[0])**2+(y-c[1])**2)/(2*w*w));row.push(1013+s.ph*g(s.H,44)-s.pl*g(s.L,34))}z.push(row)}return z}
const kmPerPx=()=>{const P=proj(),a=P([0,52]),b=P([1,52]);return 111.32*Math.cos(52*R)/Math.hypot(b[0]-a[0],b[1]-a[1])};
const bft=v=>{const B=[1,6,12,20,29,39,50,62,75,89,103,118];let i=0;while(i<B.length&&v>=B[i])i++;return i};
const compass=a=>["north","north-east","east","south-east","south","south-west","west","north-west"][Math.round(((a%360)+360)%360/45)%8];
mk("slwind",{title:"Wind: from high pressure to low",cat:"climate",h:214,
 src:"Geostrophic wind: speed = pressure gradient ÷ (air density × Coriolis parameter); near the ground friction slows it by about a third over the sea and a half over land and turns it about 20–40° towards low pressure (Met Office; Holton). Isobars every 4 hPa.",
 frame:()=>{const P=proj(),pa=d3.geoPath(P);return'<clipPath id="dgWiClip"><rect x="'+MX0+'" y="'+MY0+'" width="'+(MX1-MX0)+'" height="'+(MY1-MY0)+'" rx="7"/></clipPath><g clip-path="url(#dgWiClip)"><rect x="0" y="0" width="300" height="150" fill="#cfe4f4"/><path d="'+landPath("wind",P,f=>{try{const b=d3.geoBounds(f);return b[1][1]>25&&b[0][1]<75}catch(e){return false}})+'" fill="#e6dcb4" stroke="#a89a6a" stroke-width=".4"/><g class="wi-i"></g><g class="wi-a"></g></g><g class="wi-h"></g>'+
  '<text class="wi-big" x="8" y="152" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("wi-tx",8,155,286,22,6.3)+btn("spin",8,182,92,"Earth spins")+btn("fric",104,182,92,"Near the ground")+hint(8,210,"Drag the H and the L, and the yellow probe: closer isobars, stronger wind")},
 state:()=>({H:[86,46],L:[200,84],ph:22,pl:34,spin:1,fric:1,pr:[150,60]}),
 draw:(svg,s)=>{const z=field(s),fx=i=>MX0+i/GW*(MX1-MX0),fy=j=>MY0+j/GH*(MY1-MY0);let iso="";
  for(let v=972;v<=1040;v+=4){const d=contourPath(z,v,fx,fy);if(d)iso+='<path d="'+d+'" fill="none" stroke="#3a4f6a" stroke-width="'+(v===1012?.9:.6)+'" opacity=".75"/>'}
  setHTML(svg,".wi-i",iso);const kpp=kmPerPx();
  /* wind at a point: from the pressure gradient */
  const wind=(x,y)=>{const i=clamp((x-MX0)/(MX1-MX0)*GW,0,GW-1.001),j=clamp((y-MY0)/(MY1-MY0)*GH,0,GH-1.001),i0=Math.floor(i),j0=Math.floor(j);
   const dpx=(z[j0][i0+1]-z[j0][i0])*100/((MX1-MX0)/GW*kpp*1000),dpy=(z[j0+1][i0]-z[j0][i0])*100/((MY1-MY0)/GH*kpp*1000);/* Pa per metre, y down */
   const ll=proj().invert([x,y]),f=2*OMEGA*Math.sin((ll?ll[1]:52)*R);let vx,vy;
   if(s.spin){vx=-dpy/(RHO*f);vy=dpx/(RHO*f);/* geostrophic, northern hemisphere, y down: low pressure on the left */
    if(s.fric){const a=-30*R,k=.6,c=Math.cos(a),sn=Math.sin(a);[vx,vy]=[k*(vx*c-vy*sn),k*(vx*sn+vy*c)]}}
   else{/* no spin: air would rush straight from high to low until the difference is gone */const g=Math.hypot(dpx,dpy)||1;vx=-dpx/g*Math.min(60,g*2e4);vy=-dpy/g*Math.min(60,g*2e4)}
   return[vx,vy]};
  let a="";for(let j=0;j<7;j++)for(let i=0;i<12;i++){const x=MX0+12+i*24,y=MY0+10+j*19;const [vx,vy]=wind(x,y),v=Math.hypot(vx,vy);if(v<1)continue;const L=Math.min(18,4+v*.6),ux=vx/v,uy=vy/v;
   const col=v>25?"#b5301c":v>14?"#d2601a":v>7?"#1d4f86":"#4f7aa6";a+=arrow(x-ux*L/2,y-uy*L/2,x+ux*L/2,y+uy*L/2,col,1.3,3.6)}
  setHTML(svg,".wi-a",a);
  const [vx,vy]=wind(s.pr[0],s.pr[1]),v=Math.min(200,Math.hypot(vx,vy)*3.6),from=Math.atan2(-vx,vy)/R+180;/* direction the wind comes from */
  const lbl=(p,t,c)=>'<g class="dg-handle" data-drag="'+t+'" transform="translate('+f1(p[0])+','+f1(p[1])+')"><circle r="13" fill="transparent"/><circle r="9" fill="#fff" opacity=".85"/>'+T(0,4.2,t,'text-anchor="middle" font-size="12" font-weight="900" fill="'+c+'"')+'</g>';
  setHTML(svg,".wi-h",lbl(s.H,"H","#1d4f86")+lbl(s.L,"L","#c0392b")+'<g class="dg-handle" data-drag="P" transform="translate('+f1(s.pr[0])+','+f1(s.pr[1])+')"><circle r="12" fill="transparent"/><circle r="4" fill="#ffd24a" stroke="#1d3047" stroke-width="1"/></g>');
  const ll=proj().invert(s.pr);
  txt(svg,".wi-big",v<1.5?"At the probe: calm · force 0":"At the probe: "+Math.round(v)+" km/h from the "+compass(from)+" · force "+bft(v));
  setPara(svg,"wi-tx",!s.spin?"Without the Earth’s spin, air would flow straight from high to low pressure and the low would soon fill.":s.fric?"Near the ground friction slows the wind and turns it in towards the low, so it spirals in anticlockwise (northern hemisphere).":"Up high the spin turns the wind until it blows along the isobars: low pressure on its left in the northern hemisphere.");
  btnOn(svg,"spin",!s.spin,s.spin?"Earth spins":"No spin");btnOn(svg,"fric",!s.fric,s.fric?"Near the ground":"Up high (no friction)")},
 /* the H and the L could be dropped on top of each other, which wiped out the pressure pattern; they now stay 40 apart */
 drag:(svg,s,n,x,y)=>{const p=[clamp(x,MX0+8,MX1-8),clamp(y,MY0+8,MY1-8)];if(n==="H"||n==="L"){const o=n==="H"?s.L:s.H,dx=p[0]-o[0],dy=p[1]-o[1],r=Math.hypot(dx,dy);if(r<40){const k=40/(r||1);p[0]=clamp(o[0]+(r?dx:1)*k,MX0+8,MX1-8);p[1]=clamp(o[1]+dy*k,MY0+8,MY1-8);if(Math.hypot(p[0]-o[0],p[1]-o[1])<39)return false}if(n==="H")s.H=p;else s.L=p}else if(n==="P")s.pr=p;else return false},
 act:(svg,s,a)=>{if(a==="spin"){s.spin=!s.spin;return true}if(a==="fric"){s.fric=!s.fric;return true}}});
})();

/* smooth value noise for drawn landscapes */
function vnoise(seed){const g=(i,j)=>rnd(i*57.3+j*131.7+seed*17.1);return(x,y)=>{const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,su=u*u*(3-2*u),sv=v*v*(3-2*v);
 return lerp(lerp(g(i,j),g(i+1,j),su),lerp(g(i,j+1),g(i+1,j+1),su),sv)}}
function fbm(n,x,y,o){let s=0,a=.5,f=1;for(let i=0;i<(o||4);i++){s+=a*n(x*f,y*f);a*=.5;f*=2}return s}

/* ---------------------------------------------------------------- contour lines and a cross-section */
(function(){
const MX0=6,MY0=6,MW=196,MH=108,GW=98,GH=54,N=vnoise(7);
/* a made-up hill country, heights in metres: two summits, a saddle, a valley with a stream */
function Z(i,j){const x=i/GW,y=j/GH;const b=(cx,cy,sx,sy,h)=>h*Math.exp(-((x-cx)**2/(2*sx*sx)+(y-cy)**2/(2*sy*sy)));
 return 40+b(.3,.42,.13,.17,360)+b(.68,.5,.12,.13,230)+b(.48,.46,.08,.06,80)+60*fbm(N,x*5,y*5,4)-90*Math.exp(-Math.pow((y-.86+.08*Math.sin(x*7))/.07,2))+40*x}
let G=null;function grid(){if(G)return G;G=[];for(let j=0;j<=GH;j++){const r=[];for(let i=0;i<=GW;i++)r.push(Z(i,j));G.push(r)}return G}
const fx=i=>MX0+i/GW*MW,fy=j=>MY0+j/GH*MH;
function shade(){return tile("relief",GW*2,GH*2,(x,w,h)=>{const z=grid(),im=x.createImageData(w,h);for(let j=0;j<h;j++)for(let i=0;i<w;i++){const I=Math.min(GW-1,i/2),J=Math.min(GH-1,j/2),i0=Math.floor(I),j0=Math.floor(J);
 const v=z[j0][i0],dx=z[j0][i0+1]-v,dy=z[j0+1][i0]-v,l=clamp(.75-(dx*.9+dy*.7)/40,.35,1.15),c=v<60?[176,206,150]:v<160?[196,214,156]:v<260?[221,214,166]:v<360?[214,190,150]:[200,180,160];const k=(j*w+i)*4;
 im.data[k]=Math.min(255,c[0]*l);im.data[k+1]=Math.min(255,c[1]*l);im.data[k+2]=Math.min(255,c[2]*l);im.data[k+3]=255}x.putImageData(im,0,0)})}
const at=(x,y)=>{const z=grid(),I=clamp((x-MX0)/MW*GW,0,GW-1.001),J=clamp((y-MY0)/MH*GH,0,GH-1.001),i=Math.floor(I),j=Math.floor(J),u=I-i,v=J-j;return lerp(lerp(z[j][i],z[j][i+1],u),lerp(z[j+1][i],z[j+1][i+1],u),v)};
const KM=4/MW;/* the map is 4 km across */
mk("slcontours",{title:"Contour lines: reading hills on a flat map",cat:"maps",h:214,
 src:"A made-up hill country drawn like an Ordnance Survey or USGS topographic map: contour lines join points of equal height above sea level; every fifth line is drawn thicker (an index contour). The map is about 4 km across.",
 frame:()=>'<image href="'+shade()+'" x="'+MX0+'" y="'+MY0+'" width="'+MW+'" height="'+MH+'" preserveAspectRatio="none"/><g class="co-l"></g><g class="co-ab"></g>'+
  '<g transform="translate(208,6)"><rect width="86" height="108" rx="8" fill="#fff"/>'+T(8,13,"Contour interval",'font-size="6.4" font-weight="800" fill="'+INK+'"')+'</g>'+btn("i10",216,24,70,"every 10 m")+btn("i20",216,42,70,"every 20 m")+btn("i50",216,60,70,"every 50 m")+'<g class="co-p"></g>'+
  '<g class="co-x"></g>'+hint(8,210,"Drag A and B: lines close together mean a steep slope"),
 state:()=>({iv:20,A:[22,40],B:[180,70]}),
 draw:(svg,s)=>{const z=grid();let h="";for(let v=0;v<=480;v+=s.iv){const d=contourPath(z,v,fx,fy);if(!d)continue;const idx=v%(s.iv*5)===0;h+='<path d="'+d+'" fill="none" stroke="#8a5a2a" stroke-width="'+(idx?.95:.45)+'" opacity="'+(idx?.95:.75)+'"/>'}
  /* spot heights at the summits */let m1=[0,0,-1],m2=[0,0,-1];z.forEach((r,j)=>r.forEach((v,i)=>{if(i<GW*.5&&v>m1[2])m1=[i,j,v];if(i>GW*.55&&v>m2[2])m2=[i,j,v]}));
  [m1,m2].forEach(m=>{h+='<path d="M'+f1(fx(m[0]))+','+f1(fy(m[1])-2.6)+'l2.4,4h-4.8Z" fill="#1d3047"/>'+T(f1(fx(m[0])+4),f1(fy(m[1])+1),Math.round(m[2])+" m",'font-size="6" font-weight="800" fill="#1d3047" stroke="#fff" stroke-width="1.6" stroke-opacity=".8" paint-order="stroke"')});
  h+='<path d="M'+fx(0)+','+f1(fy(GH*.86))+'" />';
  setHTML(svg,".co-l",h);
  const hd=(p,t)=>'<g class="dg-handle" data-drag="'+t+'" transform="translate('+f1(p[0])+','+f1(p[1])+')"><circle r="12" fill="transparent"/><circle r="5.5" fill="#fff" stroke="'+ACC+'" stroke-width="1.6"/>'+T(0,2.4,t,'text-anchor="middle" font-size="6.4" font-weight="900" fill="'+ACC+'"')+'</g>';
  setHTML(svg,".co-ab",'<path d="M'+f1(s.A[0])+','+f1(s.A[1])+'L'+f1(s.B[0])+','+f1(s.B[1])+'" stroke="'+ACC+'" stroke-width="1.4" stroke-dasharray="3 2"/>'+hd(s.A,"A")+hd(s.B,"B"));
  /* the profile along A–B */
  const N2=80,pts=[],L=Math.hypot(s.B[0]-s.A[0],s.B[1]-s.A[1])*KM;let mx=0,steep=0;const hs=[];for(let k=0;k<=N2;k++){const u=k/N2,v=at(lerp(s.A[0],s.B[0],u),lerp(s.A[1],s.B[1],u));hs.push(v)}
  for(let k=1;k<=N2;k++){const g=Math.abs(hs[k]-hs[k-1])/(L*1000/N2);steep=Math.max(steep,g)}
  const X0=26,X1=290,Y0=126,Y1=178,yv=v=>Y1-(v/500)*(Y1-Y0);hs.forEach((v,k)=>pts.push([X0+k/N2*(X1-X0),yv(v)]));
  let x='<rect x="'+X0+'" y="'+Y0+'" width="'+(X1-X0)+'" height="'+(Y1-Y0)+'" fill="#eef3f8"/>';[0,100,200,300,400,500].forEach(v=>{x+='<path d="M'+X0+','+f1(yv(v))+'H'+X1+'" stroke="#d6dee8" stroke-width=".5"/>'+T(X0-3,f1(yv(v)+2),v,'text-anchor="end" font-size="5.2" fill="'+SUB+'"')});
  x+='<path d="'+ln(pts)+'L'+X1+','+Y1+'L'+X0+','+Y1+'Z" fill="#c9b48a"/><path d="'+ln(pts)+'" fill="none" stroke="#6a4a2a" stroke-width="1.2"/>'+T(X0,Y1+8,"A",'font-size="6.6" font-weight="900" fill="'+ACC+'"')+T(X1,Y1+8,"B",'text-anchor="end" font-size="6.6" font-weight="900" fill="'+ACC+'"')+T((X0+X1)/2,Y1+8,"cross-section A–B · "+L.toFixed(1)+" km · heights ×"+Math.max(1,Math.round(((Y1-Y0)/500)/((X1-X0)/(Math.max(L,.01)*1000))*10)/10),'text-anchor="middle" font-size="5.6" fill="'+SUB+'"');
  setHTML(svg,".co-x",x);
  /* with A on B there is no slope to measure (it showed "1 in NaN"); "1 in N" is now rounded to match the % shown
     (43% had read "1 in 2", which is 50%) */
  const r1=1/Math.max(steep,.001),one=r1<10?(Math.round(r1*10)/10).toFixed(1).replace(/\.0$/,""):String(Math.round(r1));
  setHTML(svg,".co-p",T(216,86,"Steepest on A–B:",'font-size="5.8" fill="'+SUB+'"')+(L<.05?T(216,97,"—",'font-size="8.6" font-weight="900" fill="'+INK+'"')+T(216,107,"pull A and B apart",'font-size="5.8" fill="'+SUB+'"'):T(216,97,"1 in "+one,'font-size="8.6" font-weight="900" fill="'+INK+'"')+T(216,107,"("+Math.round(steep*100)+"% gradient)",'font-size="5.8" fill="'+SUB+'"')));
  ["i10","i20","i50"].forEach(k=>btnOn(svg,k,s.iv===+k.slice(1)))},
 drag:(svg,s,n,x,y)=>{const p=[clamp(x,MX0+2,MX0+MW-2),clamp(y,MY0+2,MY0+MH-2)];if(n==="A")s.A=p;else if(n==="B")s.B=p;else return false},
 act:(svg,s,a)=>{const m=/^i(\d+)$/.exec(a);if(m){s.iv=+m[1];return true}}});
})();

/* ---------------------------------------------------------------- longshore drift and a spit */
(function(){
const CY=92;/* the shoreline */
mk("sllongshore",{title:"Longshore drift: how a beach moves sideways",cat:"water",h:216,
 src:"Swash runs up the beach in the direction of the waves, backwash runs straight back down, so sand zig-zags along the coast; drift is strongest when waves arrive at about 45° (the CERC formula: rate ∝ sin 2θ). Spurn Head in England, about 5 km long, is a spit built this way.",
 defs:()=>'<linearGradient id="dgLsSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d5f99"/><stop offset="1" stop-color="#5aa5dc"/></linearGradient>'+pattern("dgLsSand",speckle("sand3","#e9d6a3",["#d4bb82","#f5e7c2","#c4a86e"],520,.9),16,16)+pattern("dgLsGrass",speckle("grass2","#9fbf6a",["#86a955","#b3cf80"],400,1.2),20,20),
 frame:()=>'<clipPath id="dgLsClip"><rect x="6" y="6" width="288" height="140" rx="8"/></clipPath><g clip-path="url(#dgLsClip)"><rect x="6" y="6" width="288" height="140" fill="url(#dgLsSea)"/><g class="ls-w"></g>'+
  '<path d="M6,'+CY+' H236 C246,'+CY+' 252,'+(CY+6)+' 254,146 H6Z" fill="url(#dgLsSand)"/><path d="M6,'+(CY+16)+' H226 C240,'+(CY+16)+' 244,'+(CY+30)+' 244,146 H6Z" fill="url(#dgLsGrass)"/>'+
  '<path d="M254,146 C262,128 276,124 294,122 V146Z" fill="#6aa0c8"/>'+T(276,140,"estuary",'text-anchor="middle" font-size="5.8" font-weight="800" fill="#fff"')+
  '<g class="ls-s"></g><g class="ls-g"></g><g class="ls-p"></g></g><rect x="6" y="6" width="288" height="140" rx="8" fill="none" stroke="#9fb2c4" stroke-width=".6"/>'+
  '<text class="lsd-big" x="8" y="158" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("ls-tx",8,161,286,22,6.3)+slider("a",14,196,140,"Wave angle")+btn("gro",162,188,62,"Add groynes")+btn("play",230,188,64,"▶ Play")+hint(8,213,"Change the angle of the waves and watch the pebble and the spit"),
 state:()=>({a:35,gro:0,play:1,t:0,spit:10,ph:0,sand:0}),
 draw:(svg,s)=>{const th=s.a*R,rate=Math.sin(2*th);/* drift: + is to the right */let w="";
  /* wave crests: lines at the wave angle, moving towards the shore */
  for(let i=0;i<9;i++){const d=((s.ph*14+i*13)%117);const y=CY-6-d*.9;const dx=Math.tan(th)*60;w+='<path d="M-40,'+f1(y-dx)+' L340,'+f1(y+dx*(380/60)/2*0)+'" stroke="#fff" stroke-opacity="'+f2(.25+.5*(1-d/117))+'" stroke-width="1.2" transform="rotate('+f1(-s.a)+' 150 '+f1(y)+')"/>'}
  w+=arrow(150+Math.sin(th)*-38,CY-50,150,CY-12,"#fff",1.6,5)+T(150+Math.sin(th)*-38,CY-54,"waves",'text-anchor="middle" font-size="6.2" font-weight="800" fill="#fff"');
  setHTML(svg,".ls-w",w);
  /* the spit grows across the estuary mouth from the end of the beach */
  const L=s.spit,sp=[[236,CY],[236+L*.7,CY+L*.05],[236+L,CY+L*.18]];let p='<path d="M236,'+(CY-2)+' Q'+f1(236+L*.6)+','+f1(CY-3)+' '+f1(236+L)+','+f1(CY+L*.18)+' q4,6 -3,8 Q'+f1(236+L*.5)+','+f1(CY+6)+' 236,'+(CY+8)+'Z" fill="url(#'+uid(svg,"dgLsSand")+')" stroke="#c4a86e" stroke-width=".5"/>';
  if(L>30)p+=T(f1(236+L*.5),f1(CY-6),"spit",'text-anchor="middle" font-size="6.4" font-weight="900" fill="#5a4a1a" stroke="#fff" stroke-width="1.6" paint-order="stroke"');
  setHTML(svg,".ls-p",p);
  /* groynes trap sand on the side the drift comes from */
  let g="";if(s.gro)for(let i=0;i<4;i++){const x=50+i*50,wedge=clamp(s.sand,0,1)*12*Math.sign(rate);g+='<path d="M'+x+','+(CY+12)+' L'+(x+(wedge>0?-1:1)*30)+','+(CY+12)+' L'+x+','+f1(CY-Math.abs(wedge))+'Z" fill="url(#'+uid(svg,"dgLsSand")+')"/>'+'<rect x="'+(x-1)+'" y="'+(CY-18)+'" width="2.2" height="30" fill="#6b4a2a"/>'}
  setHTML(svg,".ls-g",g);
  /* a pebble: up the beach with the swash, straight down with the backwash */
  const cyc=(s.ph*.8)%1,step=26*rate,x0=(s.t*rate*10)%180;let px=40+((x0+360)%180),py;if(cyc<.5){const u=cyc/.5;px+=step*u;py=CY+10-u*14}else{const u=(cyc-.5)/.5;px+=step;py=CY-4+u*14}
  let tr="";for(let k=0;k<3;k++){const bx=px-step*(k+1);tr+='<path d="M'+f1(bx)+','+(CY+10)+' l'+f1(step)+',-14 l0,14" fill="none" stroke="#7a5a2a" stroke-width=".7" stroke-dasharray="2 1.5" opacity="'+f2(.7-k*.2)+'"/>'}
  setHTML(svg,".ls-s",(s.gro?"":tr+'<circle cx="'+f1(px)+'" cy="'+f1(py)+'" r="2.6" fill="#8a7a6a" stroke="#fff" stroke-width=".7"/>')+'<g transform="translate(118,'+(CY+30)+')">'+arrow(Math.sign(rate)*-24,0,Math.sign(rate)*24,0,ACC,1.6+Math.abs(rate)*2,5)+T(0,-4,"net drift",'text-anchor="middle" font-size="6" font-weight="800" fill="'+INK+'"')+'</g>');
  txt(svg,".lsd-big",Math.abs(s.a)<4?"Waves head-on: sand just moves up and down the beach":"Drift to the "+(rate>0?"right":"left")+" at "+Math.round(Math.abs(rate)*100)+"% of the most it can be");
  setPara(svg,"ls-tx",s.gro?"Groynes catch the sand on the side the drift comes from; the beach beyond them is starved of sand and wears away.":"Where the coast turns, the drift carries on into open water and builds a spit across the estuary; its end curls round in the waves.");
  setSlider(svg,"a",14,196,140,(s.a+60)/120,Math.round(Math.abs(s.a))+"° "+(s.a>0?"from the left":s.a<0?"from the right":""));btnOn(svg,"gro",!!s.gro,s.gro?"Groynes in":"Add groynes");btnOn(svg,"play",!!s.play,s.play?"❚❚ Pause":"▶ Play")},
 drag:(svg,s,n,x)=>{s.a=clamp((x-14)/140,0,1)*120-60},
 act:(svg,s,a)=>{if(a==="gro"){s.gro=!s.gro;s.sand=0;return true}if(a==="play"){s.play=!s.play;return true}},
 tick:(svg,s,dt)=>{if(!s.play)return;s.ph+=dt;s.t+=dt;const r=Math.sin(2*s.a*R);if(s.gro)s.sand=Math.min(1,s.sand+dt*.15*Math.abs(r));else if(r>0)s.spit=Math.min(62,s.spit+dt*1.2*r);DG.sllongshore._d(svg,s)}});
})();

/* ---------------------------------------------------------------- central place theory */
(function(){
const MX0=6,MY0=6,MW=288,MH=124,KM=2.6;/* px per km */
/* Christaller's settlement types in southern Germany and their spacing in km (1933) */
const LV=[["hamlet",7,"bread, a corner shop",3],["village",12,"a doctor, a primary school",6],["town",21,"a secondary school, a supermarket",12],["city",36,"a hospital, a department store",24],["regional city",62,"a university, specialist doctors",40]];
/* the triangular lattice of hamlets; a place's level: how many times it falls on the next, coarser lattice (K = 3) */
function lattice(){const a=LV[0][1]*KM,b2=[a/2,a*Math.sqrt(3)/2],pts=[];const c=[150,68];
 for(let j=-9;j<=9;j++)for(let i=-16;i<=16;i++){const x=c[0]+i*a+j*b2[0],y=c[1]+j*b2[1];if(x<MX0-30||x>MX0+MW+30||y<MY0-30||y>MY0+MH+30)continue;
  let I=i,J=j,lv=0;while(lv<4&&((I-J)%3+3)%3===0){const m=(2*I+J)/3,n=(J-I)/3;I=m;J=n;lv++}pts.push([x,y,lv])}return pts}
let LAT=null;const lat=()=>LAT||(LAT=lattice());
function fields(){return tile("cpf",576,248,(x,w,h)=>{x.fillStyle="#bcd08e";x.fillRect(0,0,w,h);for(let i=0;i<260;i++){x.fillStyle=["#c9d79a","#b2c784","#d6d79c","#a9c17c","#cdd3a0"][i%5];x.fillRect(rnd(i*2.3)*w,rnd(i*4.1)*h,20+rnd(i*1.7)*40,14+rnd(i*3.9)*26)}
 for(let i=0;i<90;i++){x.fillStyle="rgba(70,110,50,.5)";x.beginPath();x.arc(rnd(i*7.7)*w,rnd(i*5.5)*h,3+rnd(i)*5,0,7);x.fill()}})}
mk("slcentral",{title:"Central places: why towns are evenly spaced",cat:"people",h:212,
 src:"Christaller’s central place theory (1933), K = 3: each level of place serves three times the area of the one below, so spacing grows by √3 each step. Spacings for southern Germany: 7, 12, 21, 36 and 62 km.",
 frame:()=>'<clipPath id="dgCpClip"><rect x="'+MX0+'" y="'+MY0+'" width="'+MW+'" height="'+MH+'" rx="8"/></clipPath><g clip-path="url(#dgCpClip)"><image href="'+fields()+'" x="'+MX0+'" y="'+MY0+'" width="'+MW+'" height="'+MH+'" preserveAspectRatio="none"/><g class="cp-h"></g><g class="cp-p"></g></g>'+
  '<rect x="'+MX0+'" y="'+MY0+'" width="'+MW+'" height="'+MH+'" rx="8" fill="none" stroke="#9fb2c4" stroke-width=".6"/><path d="M14,'+(MY0+MH-8)+'h'+f1(10*KM)+'" stroke="#1d3047" stroke-width="1.6"/>'+T(14,MY0+MH-11,"10 km",'font-size="5.8" font-weight="800" fill="'+INK+'"')+
  '<text class="cp-big" x="8" y="142" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("cp-tx",8,145,286,22,6.3)+slider("r",14,186,276,"How far people will travel for it")+hint(8,207,"Drag: the further people will go, the fewer, bigger places needed"),
 state:()=>({r:5}),
 draw:(svg,s)=>{let k=0;while(k<LV.length-1&&LV[k][1]/Math.sqrt(3)<s.r)k++;const pts=lat(),d=LV[k][1]*KM,rad=d/Math.sqrt(3),rot=k%2?0:30;let h="",p="";
  pts.forEach(([x,y,lv])=>{if(lv<k)return;let hx="";for(let i=0;i<6;i++){const a=(rot+60*i)*R;hx+=(i?"L":"M")+f1(x+Math.cos(a)*rad)+","+f1(y+Math.sin(a)*rad)}h+=hx+"Z"});
  setHTML(svg,".cp-h",'<path d="'+h+'" fill="#e8701a" fill-opacity=".12" stroke="#c0561d" stroke-width="1.1"/>');
  pts.forEach(([x,y,lv])=>{if(x<MX0-4||x>MX0+MW+4||y<MY0-4||y>MY0+MH+4)return;const on=lv>=k,r=[1.5,2.3,3.2,4.2,5.4][Math.min(lv,4)];
   p+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+r+'" fill="'+(on?"#c0392b":"#7a6a5a")+'" stroke="#fff" stroke-width=".6" opacity="'+(on?1:.6)+'"'+tip(LV[Math.min(lv,4)][0])+'/>'});
  setHTML(svg,".cp-p",p);const n=pts.filter(q=>q[2]>=k&&q[0]>MX0&&q[0]<MX0+MW&&q[1]>MY0&&q[1]<MY0+MH).length;
  txt(svg,".cp-big","Up to "+Math.round(s.r)+" km: "+LV[k][0].replace(/y$/,"ie")+"s, about "+LV[k][1]+" km apart ("+n+" on this map)");
  setPara(svg,"cp-tx","Things like "+LV[k][2]+" need enough customers (the threshold) within the distance people will travel (the range). Hexagons share out the land with no gaps and no overlaps.");
  setSlider(svg,"r",14,186,276,(s.r-2)/40,Math.round(s.r)+" km")},
 drag:(svg,s,n,x)=>{s.r=2+clamp((x-14)/276,0,1)*40}});
})();

/* ---------------------------------------------------------------- sea-level rise on a low coast */
(function(){
const MX0=6,MY0=6,MW=288,MH=112,N=vnoise(3);
/* a made-up low coast: dunes along the shore, marsh behind them, a river, a town on higher ground (metres above today's sea) */
let ZG=null;function Zgrid(){if(ZG)return ZG;ZG=new Float32Array(MW*MH);for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const yc=86+5*Math.sin(x/38)+3*Math.sin(x/13),d=yc-y;/* px inland, 1 px = 100 m */
 let z=d<0?-1-(-d)*.08:.08*d;z+=d>1&&d<8?3.8*Math.exp(-Math.pow((d-4)/2.2,2))*(1-.6*Math.exp(-Math.pow((x-150)/7,2))):0;/* dunes, cut by the river */
 z-=1.6*Math.exp(-Math.pow((d-18)/9,2))*(d>8?1:0)*(.7+.6*N(x/30,1));/* marsh behind the dunes */
 const rx=150+10*Math.sin(y/14);z=Math.min(z,-.4+Math.abs(x-rx)*.09+(d<0?0:0));/* the river */
 z+=3.6*Math.exp(-(((x-214)/26)**2+((y-44)/18)**2));/* the town's low hill */
 z+=.9*(fbm(N,x/22,y/22,3)-.5);ZG[y*MW+x]=z}return ZG}
/* the water: everything below the level that is joined to the open sea */
function flood(lv){const Z=Zgrid(),F=new Uint8Array(MW*MH),st=[];for(let x=0;x<MW;x++){const i=(MH-1)*MW+x;if(Z[i]<lv){F[i]=1;st.push(i)}}
 while(st.length){const i=st.pop(),x=i%MW,y=(i-x)/MW;const nb=[x>0?i-1:-1,x<MW-1?i+1:-1,y>0?i-MW:-1,y<MH-1?i+MW:-1];for(const j of nb){if(j>=0&&!F[j]&&Z[j]<lv){F[j]=1;st.push(j)}}}return F}
const TOWN=[];for(let i=0;i<150;i++){const x=Math.round(186+rnd(i*3.1)*58),y=Math.round(28+rnd(i*7.3)*36);TOWN.push([x,y])}
const FARM=[];for(let i=0;i<70;i++)FARM.push([Math.round(14+rnd(i*5.7)*270),Math.round(10+rnd(i*2.9)*68)]);
function img(lv){const Z=Zgrid(),F=flood(lv),c=document.createElement("canvas");c.width=MW;c.height=MH;const x=c.getContext("2d"),im=x.createImageData(MW,MH);let land=0,wet=0;
 const F0=flood(0);for(let i=0;i<MW*MH;i++){const z=Z[i],k=i*4;let r,g,b;if(F[i]){const dep=lv-z;if(F0[i]){r=40+20*Math.exp(-dep);g=110+60*Math.exp(-dep);b=190}else{r=110;g=185;b=225;wet++}}
  else{const t=clamp(z/8,0,1),xx=i%MW,yy=(i-xx)/MW;const l=1+.12*(fbm(N,xx/6,yy/6,2)-.5);r=(150+t*70)*l;g=(190-t*20)*l;b=(110+t*20)*l;if(z<1.2){r=128;g=168;b=110}}
  if(!F0[i])land++;im.data[k]=r;im.data[k+1]=g;im.data[k+2]=b;im.data[k+3]=255}x.putImageData(im,0,0);
 /* the town's houses and farms, grey if flooded */
 /* homes that the random scatter put in the river or sea today are not drawn or counted ("Today's coast · 4 of 220
    homes flooded" at +0 m) */
 let homes=0,lost=0;TOWN.concat(FARM).forEach(([hx,hy],i)=>{if(F0[hy*MW+hx])return;const f=F[hy*MW+hx];homes++;if(f)lost++;x.fillStyle=f?"rgba(70,110,150,.8)":i<TOWN.length?"#b8a898":"#c9583c";x.fillRect(hx-1,hy-1,i<TOWN.length?3:2,i<TOWN.length?3:2)});
 return{u:c.toDataURL(),pct:wet/land,homes,lost}}
mk("slsealevel",{title:"Sea-level rise on a low coast",cat:"water",h:216,
 src:"Global sea level rose about 0.2 m from 1901 to 2018; by 2100 it is likely to rise 0.3–0.6 m with low emissions and 0.6–1.0 m with very high ones, and 2 m cannot be ruled out (IPCC AR6 WG1, 2021). The coast is made up; 1 pixel ≈ 100 m.",
 frame:()=>'<image class="sv-i" x="'+MX0+'" y="'+MY0+'" width="'+MW+'" height="'+MH+'" preserveAspectRatio="none" style="image-rendering:auto"/><rect x="'+MX0+'" y="'+MY0+'" width="'+MW+'" height="'+MH+'" rx="2" fill="none" stroke="#9fb2c4" stroke-width=".6"/>'+
  T(214,24,"town",'text-anchor="middle" font-size="6.4" font-weight="900" fill="#3a2a1a" stroke="#fff" stroke-width="1.8" stroke-opacity=".7" paint-order="stroke"')+T(60,72,"marsh and farms",'font-size="6.2" font-weight="800" fill="#2a4a1a" stroke="#fff" stroke-width="1.8" stroke-opacity=".7" paint-order="stroke"')+T(250,102,"dunes",'font-size="6.2" font-weight="800" fill="#5a4a1a" stroke="#fff" stroke-width="1.8" stroke-opacity=".7" paint-order="stroke"')+T(156,30,"river",'font-size="6.2" font-weight="800" fill="#1d4f86" stroke="#fff" stroke-width="1.8" stroke-opacity=".7" paint-order="stroke"')+
  '<text class="sv-big" x="8" y="130" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("sv-tx",8,133,286,22,6.3)+slider("l",14,172,200,"Sea-level rise")+btn("surge",226,164,68,"+ storm surge")+'<g class="sv-m"></g>'+hint(8,212,"Drag the sea up: the water gets in by the river before it tops the dunes"),
 state:()=>({l:0,surge:0}),
 draw:(svg,s)=>{const lv=s.l+(s.surge?2:0),key=Math.round(lv*20);if(s._k!==key){s._k=key;const r=img(key/20);s._r=r;const im=q(svg,".sv-i");if(im)im.setAttribute("href",r.u)}const r=s._r;
  txt(svg,".sv-big",(lv<.02?"Today’s coast":"+"+lv.toFixed(2)+" m: "+Math.round(r.pct*100)+"% of the land under water")+(r.lost?" · "+r.lost+" of "+r.homes+" homes flooded":""));
  setPara(svg,"sv-tx",s.surge?"A storm surge piles the sea up 2 m more for a few hours: on a higher sea, every storm reaches further inland.":lv<.3?"Low marsh and farmland lie only a metre or so above the sea, kept dry by the dunes.":"The sea creeps up the river and spreads over the marsh behind the dunes. About one person in ten worldwide lives less than 10 m above the sea.");
  let m="";[[.44,"2100, low emissions"],[.77,"2100, very high"],[2,"2 m: can’t be ruled out"]].forEach(([v,t],i)=>{const x=14+v/2.5*200;m+='<path d="M'+f1(x)+',176v'+(4+i%2*7)+'" stroke="#9fb2c4"/>'+T(f1(x),185+i%2*7,t,'text-anchor="'+(i===2?"end":"middle")+'" font-size="5.2" fill="'+SUB+'"')});
  setHTML(svg,".sv-m",m);setSlider(svg,"l",14,172,200,s.l/2.5,"+"+s.l.toFixed(2)+" m");btnOn(svg,"surge",!!s.surge,s.surge?"surge on":"+ storm surge")},
 drag:(svg,s,n,x)=>{s.l=clamp((x-14)/200,0,1)*2.5},
 act:(svg,s,a)=>{if(a==="surge"){s.surge=!s.surge;return true}}});
})();

/* ===================================================================== the dictionary */
/* term → simulation (key or key:tab). Terms already given a simulation by geoflock-diagrams2.js keep theirs unless named here. */
const TERMS={
 /* the solid Earth */
 "Plate tectonics":"plates","Tectonic plate":"plates","Ring of Fire":"plates","Continental drift":"pangaea","Pangaea":"pangaea","Gondwana":"pangaea",
 "Divergent boundary":"platebound:0","Seafloor spreading":"platebound:0","Mid-ocean ridge":"platebound:0","Convergent boundary":"platebound:1","Subduction zone":"platebound:1","Ocean trench":"platebound:1","Island arc":"platebound:1",
 "Fold mountains":"platebound:2","Orogeny":"platebound:2","Transform boundary":"platebound:3","Hotspot":"hawaii","Seamount":"hawaii:1",
 "Lithosphere":"geology","Asthenosphere":"geology","Crust":"geology","Mantle":"geology","Core":"geology","Magma":"volcano","Pyroclastic flow":"volcano","Volcanic eruption":"volcano",
 "Rock cycle":"rockcycle","Igneous rock":"rockcycle","Sedimentary rock":"rockcycle","Metamorphic rock":"rockcycle","Sediment":"rockcycle","Weathering":"rockcycle",
 "Earthquake":"epicentre","Epicenter":"epicentre","Richter scale":"quake","Tsunami":"tsunami","Isostasy":"slisostasy","Ice sheet":"slisostasy",
 /* rivers, coasts, the sea */
 "Meander":"meander","Oxbow lake":"meander","Floodplain":"meander","Erosion":"meander","Deposition":"meander","Levee":"meander","River":"meander",
 "Longshore drift":"sllongshore","Spit":"sllongshore","Beach":"sllongshore","Barrier island":"sllongshore","Tombolo":"sllongshore",
 "Tide":"tides","Tidal range":"tides","Spring tide":"tides","Neap tide":"tides","Tidal power":"tides",
 "Sea-level rise":"slsealevel","Storm surge":"slsealevel","Coastline":"slsealevel","Water cycle":"slwater","Evaporation":"slwater",
 "Ocean acidification":"oceanph","Dead zone":"deadzone","Eutrophication":"deadzone","Fertilizer runoff":"deadzone","Overfishing":"fishery","Tragedy of the commons":"fishery","Dam":"nileflow","Reservoir":"nileflow",
 "Last Glacial Maximum":"humsea","Beringia":"humsea","Doggerland":"humsea","Ice age":"humsea","Wallace Line":"wallace","Biogeographic realm":"wallace",
 /* weather and climate */
 "Rain shadow":"rainshadow","Foehn wind":"rainshadow","Coriolis effect":"coriolis","Wind":"slwind","Air pressure":"slwind","High-pressure system":"slwind","Low-pressure system":"slwind",
 "Sea breeze":"slseabreeze","Local wind":"slseabreeze","Monsoon":"monsoon","Tropical monsoon climate":"monsoon","El Niño":"slnino","La Niña":"slnino",
 "Greenhouse effect":"slgreenhouse","Greenhouse gas":"slgreenhouse","Climate change":"co2","Carbon cycle":"slcarbon","Carbon sink":"slcarbon","Photosynthesis":"slcarbon","Fossil fuel":"slcarbon","Carbon footprint":"slcarbon",
 "Urban heat island":"sluhi","Microclimate":"sluhi","Tropical cyclone":"hurricane","Saffir–Simpson scale":"hurricane","Insolation":"sunangle","Altitudinal zonation":"climb",
 "Solstice":"sldaylen","Equinox":"sldaylen","Arctic Circle":"sldaylen","Antarctic Circle":"sldaylen","Tropic of Cancer":"sldaylen","Tropic of Capricorn":"sldaylen","Tropics":"seasons",
 "Hadley cell":"chadley","ITCZ":"chadley","Subtropical high":"chadley","Horse latitudes":"chadley","Continentality":"ccont","Maritime effect":"cmar","Mediterranean climate":"cmed",
 /* maps */
 "Latitude":"sllatlon","Longitude":"sllatlon","Equator":"sllatlon","Prime meridian":"sllatlon","Hemisphere":"sllatlon","Absolute location":"sllatlon","Globe":"sllatlon",
 "Map projection":"sltissot:2","Distortion":"sltissot:0","Mercator projection":"sltissot:0","Web Mercator":"sltissot:0","Conformal projection":"sltissot:0","Robinson projection":"sltissot:1","Equal-area projection":"sltissot:2","Gall–Peters projection":"sltissot:3","Azimuthal projection":"sltissot:4",
 "Time zone":"slsuntime","Greenwich Mean Time":"slsuntime","International Date Line":"worldclock",
 "Contour line":"slcontours","Topographic map":"slcontours","Isoline map":"slcontours","Relief":"slcontours","Topography":"slcontours","Elevation":"slcontours",
 /* people, cities, farming, trade */
 "Demographic transition model":"dtm","DTM Stage 1":"dtm","DTM Stage 2":"dtm","DTM Stage 3":"dtm","DTM Stage 4":"dtm","DTM Stage 5":"dtm",
 "Population pyramid":"pyramid","Cohort":"pyramid","Dependency ratio":"pyramid","Aging population":"pyramid","Baby boom":"pyramid","Population momentum":"pyramid",
 "Doubling time":"doubling","Exponential growth":"doubling","Rate of natural increase":"doubling",
 "Gravity model":"gravity","Distance decay":"gravity","Spatial interaction":"gravity","Friction of distance":"gravity",
 "Von Thünen model":"vonthunen","Bid-rent theory":"vonthunen",
 "Concentric zone model":"citymodels:0","Sector model":"citymodels:1","Multiple nuclei model":"citymodels:2","Central business district":"citymodels:0","Zone in transition":"citymodels:0",
 "Central place theory":"slcentral","Threshold":"slcentral","Range (of a good)":"slcentral","Market area":"slcentral","Hinterland":"slcentral",
 "Rank-size rule":"ranksize","Primate city":"ranksize","Weber's least-cost theory":"weber","Bulk-reducing industry":"weber","Bulk-gaining industry":"weber",
 "Choke point":"chokes","Silk Road":"silkroad","Container port":"boxes","Break-of-bulk point":"boxes","Light pollution":"stars",
 "Island biogeography":"islmw","Species richness":"islspa","Adaptive radiation":"islbeak","Habitat fragmentation":"islfrag","Ecological succession":"islkrak","Primary succession":"islkrak"
};
const simOf=t=>{let k=TERMS[t];if(!k){try{const D2=window.gfDiag2&&gfDiag2.TERMS;const v=D2&&D2[t];if(v&&isSim(String(v).split(":")[0]))k=v}catch(e){}}return k&&DG[String(k).split(":")[0]]?k:null};
function isSim(k){try{return(typeof SIM_KEYS!=="undefined"&&SIM_KEYS.includes(k))||!!(DG[k]&&(DG[k].drag||DG[k].act))}catch(e){return false}}
const dictTerms=()=>Array.isArray(window.GF_DICT)?GF_DICT.map(e=>e.t):[];
let NSIM=null;const count=()=>NSIM!=null?NSIM:(NSIM=dictTerms().filter(simOf).length);
function photo(t){const P=(window.GF_DICT_IMG||{})[t];if(!P||!P.d)return"";return'<figure class="gfdv-fig"><img loading="lazy" alt="'+esc(t)+'" src="'+esc(P.d)+'"><figcaption>'+esc(P.caption||"")+'<small class="gfdv-cr">'+esc(P.by||"")+(P.lic?" · "+esc(P.lic):"")+'</small></figcaption></figure>'}
function simSection(k,t){const key=String(k).split(":")[0],D=DG[key];return'<details class="gfsl-dsim" open><summary><span class="gfsl-play">▶</span> Simulation <b>'+esc(D.title)+'</b></summary>'+dgFigure(k)+'</details>'}
function wireDict(){const Vis=window.gfDictVis;if(!Vis||Vis._gfsl)return false;Vis._gfsl=1;const base=Vis.visual;
 Vis.visual=function(e){const k=e&&simOf(e.t);if(!k)return base.apply(this,arguments);let h="";try{h=photo(e.t)}catch(_){}return h+simSection(k,e.t)};return true}

/* ===================================================================== the Library's Simulations tab */
const CATN=[["earth","Earth & sky","🌍"],["plates","Land & rock","⛰️"],["water","Water & ice","🌊"],["climate","Weather & climate","⛅"],["people","People & cities","🏙️"],["econ","Money & trade","🚢"],["maps","Maps & measuring","📐"],["other","Other","✨"]];
const GUESS={seasons:"earth",sunangle:"earth",worldclock:"earth",coriolis:"climate",stars:"earth",earthday:"earth",polaris:"maps",tissot:"maps",mercator:"maps",
 geology:"plates",volcano:"plates",rockcycle:"plates",epicentre:"plates",quake:"plates",tsunami:"water",supercont:"plates",pangaea:"plates",faults:"plates",vtypes:"plates",platebound:"plates",plates:"plates",hawaii:"plates",
 waterball:"water",slr:"water",depth:"water",antslice:"water",meander:"water",nileflow:"water",tides:"water",fishery:"water",oceanph:"water",deadzone:"water",glacier:"water",deltas:"water",coasterode:"water",upwell:"water",waterfall:"water",aquifer:"water",humsea:"water",wallace:"water",
 rainshadow:"climate",monsoon:"climate",co2:"climate",hurricane:"climate",climb:"climate",rain:"climate",soils:"climate",desert:"climate",cmon:"climate",cmed:"climate",cmar:"climate",chadley:"climate",ccont:"climate",
 pyramid:"people",dtm:"people",gravity:"people",doubling:"people",citymodels:"people",urban:"people",shrink:"people",humtime:"people",ranksize:"people",
 vonthunen:"econ",weber:"econ",chokes:"econ",growth:"econ",boxes:"econ",silkroad:"econ",
 islspa:"other",islmw:"other",islkrak:"other",islbeak:"other",islrule:"other",islfrag:"other",empires:"other",nukes:"other",juntas:"other",h2un:"other",h2cost:"other"};
const catOf=k=>{const D=DG[k]||{};return D.cat==="plates"||D.cat==="earth"||D.cat==="water"||D.cat==="climate"||D.cat==="people"||D.cat==="econ"||D.cat==="maps"?D.cat:GUESS[k]||(D.cat==="water"?"water":"other")};
const DESC={
 hawaii:"Slide the Pacific plate back over the Hawaiian plume: real coastlines, island ages, volcanoes that grow and sink.",
 plates:"Every plate boundary on Earth, coloured by how the plates meet, and cities carried along for 50 million years.",
 platebound:"Pull apart, sink under, crash together, slide past: four textured cross-sections you can run like a clock.",
 meander:"Bends grow on a flood plain until the river cuts through the neck and leaves an oxbow lake.",
 tides:"Drag the Moon round the Earth: two bulges, two tides a day, spring tides and neap tides.",
 monsoon:"Month by month over a real map of South Asia: the wind turns round and Mumbai’s rain arrives.",
 gravity:"Fifteen real US cities: tap one to see which others it pulls on hardest, and how distance weakens the pull.",
 mercator:"Drag real Greenland, Australia, Brazil or DR Congo north and south on a Mercator map.",
 citymodels:"Burgess, Hoyt and Harris–Ullman drawn as city plans: tap a zone, let the city grow.",
 vonthunen:"Rings of farming round a market town; change the transport cost, add a river, raise the grain price.",
 tsunami:"The 2004 wave crossing the Bay of Bengal on the real depth profile: fast in deep water, tall near land.",
 sldaylen:"Pick any latitude and date: hours of daylight, sunrise and sunset, the midnight sun and the polar night.",
 slgreenhouse:"Turn up the greenhouse gases and watch the energy flows and the ground temperature change.",
 slisostasy:"Load the crust with an ice sheet, then melt it: the land rises for thousands of years.",
 slseabreeze:"Run a summer day on the coast: the breeze blows in from the sea by day and out by night.",
 slnino:"Slide from La Niña to El Niño: warm water, trade winds and rain move across the Pacific.",
 sluhi:"Temperatures across a city by day and night; add wind or trees and see the heat island shrink.",
 slcarbon:"Set how much fossil fuel we burn: see where the carbon goes and how fast CO₂ in the air rises.",
 slwater:"Follow one drop of water through ocean, air, rivers, ice and rock, with the real odds and times.",
 sllatlon:"Drag a pin on a spinning globe and read its latitude and longitude, and the nearest big city.",
 sltissot:"The same circle on five world maps: see which ones keep areas true and which keep shapes.",
 slsuntime:"Drag the Sun across a world map and compare each city’s clock with where the Sun really is.",
 slwind:"Drag a high and a low: isobars, wind arrows, the Earth’s spin and friction near the ground.",
 slcontours:"Read hills from contour lines: change the interval and draw a cross-section between two points.",
 sllongshore:"Waves at an angle push sand along the beach: groynes trap it and a spit grows across the estuary.",
 slcentral:"Hexagons of market areas: the further people travel for something, the fewer, bigger places supply it.",
 slsealevel:"Raise the sea on a low coast with dunes, marsh and a town, with or without a storm surge."};
let SL={cat:"all",open:null};
function allSims(){let L=[];try{L=(typeof SIM_KEYS!=="undefined"?SIM_KEYS.slice():[])}catch(e){}K.SIMS.concat(NEW).forEach(k=>{if(!L.includes(k))L.push(k)});return L.filter(k=>DG[k])}
const termsFor=k=>{const out=[];const all=Object.assign({},(window.gfDiag2&&gfDiag2.TERMS)||{},TERMS);Object.keys(all).forEach(t=>{if(String(all[t]).split(":")[0]===k&&(!dictTerms().length||dictTerms().includes(t)))out.push(t)});return out};
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
function libHTML(qs){const Q=norm(qs).trim(),L=allSims();const hay=k=>norm((DG[k].title||"")+" "+(DESC[k]||"")+" "+termsFor(k).join(" ")+" "+k);
 const F=L.filter(k=>(SL.cat==="all"||catOf(k)===SL.cat)&&(!Q||Q.split(/\s+/).every(w=>hay(k).includes(w))));
 const counts={};L.forEach(k=>{const c=catOf(k);counts[c]=(counts[c]||0)+1});
 let h='<p class="gfsl-intro"><b>'+L.length+' simulations.</b> Drag, slide and toggle: each one shows one idea with real numbers. <span class="gfsl-newk">New</span> ones were made for the library; the rest come from the guided tours.</p>';
 h+='<div class="gflib-chips"><button type="button" data-slc="all" class="'+(SL.cat==="all"?"on":"")+'">All <i>'+L.length+'</i></button>'+CATN.filter(c=>counts[c[0]]).map(c=>'<button type="button" data-slc="'+c[0]+'" class="'+(SL.cat===c[0]?"on":"")+'">'+c[2]+" "+c[1]+' <i>'+counts[c[0]]+'</i></button>').join("")+'</div>';
 h+='<div class="gfsl-player"'+(SL.open&&F.includes(SL.open)?"":" hidden")+'>'+(SL.open&&F.includes(SL.open)?player(SL.open):"")+'</div>';
 h+='<div class="gfsl-grid">'+(F.length?F.map(k=>{const D=DG[k],c=CATN.find(x=>x[0]===catOf(k))||CATN[7],tt=termsFor(k).slice(0,4);
  return'<button type="button" class="gfsl-card'+(SL.open===k?" on":"")+'" data-slk="'+k+'"><span class="gfsl-ic">'+c[2]+'</span><span class="gfsl-tx"><b>'+esc(D.title)+(NEW.includes(k)?' <span class="gfsl-newk">New</span>':'')+'</b><small>'+esc(DESC[k]||(c[1]+" · from the tours"))+'</small>'+(tt.length?'<em>'+tt.map(esc).join(" · ")+'</em>':'')+'</span><span class="gfsl-go">▶</span></button>'}).join(""):'<p class="gflib-empty">No simulation matches “'+esc(qs)+'”.</p>')+'</div>';
 return'<div class="gfsl-lib">'+h+'</div>'}
function player(k){const tt=termsFor(k);return'<div class="gfsl-ph"><b>'+esc(DG[k].title)+'</b><button type="button" class="gfsl-x" aria-label="Close">×</button></div>'+dgFigure(k)+(tt.length?'<p class="gfsl-terms">In the dictionary: '+tt.map(t=>'<button type="button" class="gflib-link" data-slt="'+esc(t)+'">'+esc(t)+'</button>').join(" · ")+'</p>':'')}
let API=null;
function wireLib(c,api){API=api||API;const box=c.querySelector(".gfsl-lib");if(!box)return;const body=c.querySelector(".gflib-body")||c;
 const redraw=()=>{const qi=c.querySelector(".gflib-q");box.outerHTML=libHTML(qi?qi.value:"");wireLib(c)};
 box.querySelectorAll("[data-slc]").forEach(b=>b.onclick=()=>{SL.cat=b.dataset.slc;SL.open=null;redraw()});
 box.querySelectorAll("[data-slk]").forEach(b=>b.onclick=()=>{SL.open=SL.open===b.dataset.slk?null:b.dataset.slk;redraw();const p=c.querySelector(".gfsl-player:not([hidden])");if(p)p.scrollIntoView({block:"start",behavior:"smooth"})});
 const x=box.querySelector(".gfsl-x");if(x)x.onclick=()=>{SL.open=null;redraw()};
 box.querySelectorAll("[data-slt]").forEach(b=>b.onclick=()=>{try{(API&&API.showTerm||window.gfLibrary.showTerm)(b.dataset.slt)}catch(e){}})}

window.gfSimLib={has:t=>!!simOf(t),simOf,count,html:libHTML,wire:wireLib,terms:TERMS,keys:allSims,isNew:k=>NEW.includes(k)};
function finish(){if(!wireDict()){let n=0;const w=setInterval(()=>{if(wireDict()||++n>40)clearInterval(w)},500)}}
finish();
const css=document.createElement("style");css.textContent=`
.gfsl-dsim{margin:4px 0 12px;border-radius:12px;background:rgba(43,123,181,.06);padding:4px 6px 2px}
.gfsl-dsim>summary{cursor:pointer;list-style:none;font:800 13px system-ui;padding:5px 4px;color:#1d3047;display:flex;align-items:center;gap:6px}
.gfsl-dsim>summary::-webkit-details-marker{display:none}
.gfsl-dsim>summary b{font-weight:600;opacity:.75}
.gfsl-play{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#e8701a;color:#fff;font-size:10px}
.gfsl-dsim .ps-dg{max-width:560px;margin:2px 0 6px}.gfsl-dsim .ps-dg-svg svg{max-height:none}
body.sky-night .gfsl-dsim{background:rgba(255,255,255,.06)}body.sky-night .gfsl-dsim>summary{color:#e8ecf6}
.gfsl-intro{margin:0 0 8px;font-size:13px;opacity:.85}
.gfsl-newk{display:inline-block;font:800 9.5px system-ui;letter-spacing:.04em;text-transform:uppercase;background:#e8701a;color:#fff;border-radius:999px;padding:1px 6px;vertical-align:1px}
.gfsl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}
.gfsl-card{display:flex;align-items:flex-start;gap:9px;text-align:left;border:1px solid rgba(0,0,0,.1);background:#fff;border-radius:12px;padding:9px 10px;cursor:pointer;color:inherit;font:inherit}
.gfsl-card:hover{border-color:#2f6fb0;box-shadow:0 2px 10px rgba(47,111,176,.15)}.gfsl-card.on{border-color:#e8701a;box-shadow:0 0 0 2px rgba(232,112,26,.25)}
.gfsl-ic{font-size:20px;line-height:1;flex:none;margin-top:1px}.gfsl-tx{flex:1;min-width:0}.gfsl-tx b{display:block;font-size:13.5px;line-height:1.25}
.gfsl-tx small{display:block;font-size:12px;opacity:.75;margin-top:2px;line-height:1.35}.gfsl-tx em{display:block;font-style:normal;font-size:11px;color:#2f6fb0;margin-top:3px}
.gfsl-go{flex:none;width:24px;height:24px;border-radius:50%;background:#2f6fb0;color:#fff;display:grid;place-items:center;font-size:10px;margin-top:2px}
body.sky-night .gfsl-card{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12)}body.sky-night .gfsl-tx em{color:#8fc0ff}
.gfsl-player{margin:0 0 12px;scroll-margin-top:8px}.gfsl-player .ps-dg{max-width:640px;margin:0 auto}.gfsl-player .ps-dg-svg svg{max-height:none}
.gfsl-ph{display:flex;align-items:center;justify-content:space-between;max-width:640px;margin:0 auto 4px;font-size:14px}
.gfsl-x{border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:inherit;opacity:.7}
.gfsl-terms{max-width:640px;margin:4px auto 0;font-size:12.5px}
.gflib-chips button.c-sim{border-color:#e8701a;color:#c0561d;font-weight:700}.gflib-chips button.c-sim.on{background:#e8701a;color:#fff;border-color:#e8701a}
@media (max-width:640px){.gfsl-grid{grid-template-columns:1fr}.gflib-tabs{max-width:100%;overflow-x:auto;scrollbar-width:none}.gflib-tabs::-webkit-scrollbar{display:none}.gflib-tabs button{white-space:nowrap;padding:6px 9px;font-size:12px}}`;document.head.appendChild(css);
})();
