/* GeoFlock: simulation review, batch 1 (DG keys agefert … growth). Fixes and new play for diagrams that live in
   index.html, re-registered here under their old keys so tour stops, the Models browser and the dictionary pick them up.
     earthday  Earth's history as one day: the flag could never reach midnight (it stopped 18,917 years ago, with the clock
               already reading 24:00:00), so farming and "now" were out of reach. The flag now runs to midnight, the
               last-minute strip is draggable too, writing is added, and a "Quiz me" mode asks you to place an event on
               the clock before it shows where it really is.
     depth     How deep the ocean goes: the submarine could only go straight down over the abyssal plain (4,800 m) and
               never reach the trench the diagram is about. It now steers sideways too, follows the sea floor, and can
               dive into the Challenger Deep, with the hadal zone and the 1960 Trieste dive.
   Loaded after index.html's own diagrams. */
(function(){
"use strict";
if(typeof DG==="undefined"||typeof dgT!=="function")return;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const tipA=t=>' data-tip="'+esc(t)+'"';
const dyn=(svg,h)=>{try{dgDyn(svg,h)}catch(e){const g=svg.querySelector(".dg-dyn");if(g)g.innerHTML=h}};

/* ------------------------------------------------------------------ Earth's history as one day */
try{(function(){
const D0=DG.earthday;if(!D0)return;
/* ages in millions of years: the ICS chart (rounded) as before; writing about 3200 BC (cuneiform, Uruk; Encyclopaedia
   Britannica, "cuneiform") */
const EV=[[4540,"The Earth forms"],[4500,"The Moon forms"],[3500,"Oldest fossils of life (bacteria)"],[2400,"Oxygen builds up in the air"],[600,"The first animals"],[539,"Life explodes in the seas (Cambrian)"],[470,"Plants spread onto land"],[230,"The first dinosaurs"],[66,"An asteroid ends the dinosaurs"],[.3,"Our species appears"],[.012,"Farming begins"],[.0052,"Writing begins"]];
const AGE=4540,X0=14,X1=286,L0=60,L1=286,LS=86400/AGE;/* clock seconds per million years */
const sx=h=>X0+h/24*(X1-X0),at=a=>24*(1-a/AGE),lx=sec=>L0+(sec+60)/60*(L1-L0);
const clock=h=>{if(h>=24-1e-9)return"24:00:00";const s=h*3600,hh=Math.floor(s/3600),mm=Math.floor(s%3600/60),ss=s%60;
  const p=n=>String(n).padStart(2,"0");return p(hh)+":"+p(mm)+(h>=23.98?":"+(ss<10?"0":"")+Math.min(59.9,Math.floor(ss*10)/10).toFixed(1):"")};
const ageTxt=a=>a<=0?"now":a>=1e3?(a/1e3).toFixed(2)+" billion years ago":a>=1?fmt(a)+" million years ago":fmt(a*1e6)+" years ago";
const offTxt=dh=>{const s=Math.abs(dh)*3600;return s<60?(s<1?s.toFixed(2):s.toFixed(1))+" seconds":s<3600?Math.round(s/60)+" min":Math.floor(s/3600)+" h "+Math.round(s%3600/60)+" min"};
const S={h:23.66,q:null,score:[0,0]};
function btn(act,x,y,w,label,on){return'<g data-act="'+act+'" style="cursor:pointer"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="15" rx="7.5" fill="'+(on?"#e8701a":"#1d3047")+'"/>'+dgT(x+w/2,y+10.4,label,'font-size="7.2" font-weight="800" text-anchor="middle" fill="#fff"')+"</g>"}
function draw(svg){const hh=S.h,age=Math.max(0,(1-hh/24)*AGE),Q=S.q;let h="";
  h+='<rect x="'+X0+'" y="40" width="'+(X1-X0)+'" height="16" rx="4" fill="#e8eef4"/>';
  for(let i=0;i<=24;i+=3)h+='<line x1="'+sx(i).toFixed(1)+'" x2="'+sx(i).toFixed(1)+'" y1="56" y2="60" stroke="#1d3047"/>'+dgT(sx(i).toFixed(1),68,String(i).padStart(2,"0")+":00",'text-anchor="middle" font-size="6.8"');
  h+='<rect x="'+sx(0)+'" y="40" width="'+(sx(at(2400))-sx(0)).toFixed(1)+'" height="16" rx="4" fill="#d9c7a3" opacity=".6"'+tipA("Only bacteria-like life, no oxygen in the air")+'/><rect x="'+sx(at(539)).toFixed(1)+'" y="40" width="'+(sx(24)-sx(at(539))).toFixed(1)+'" height="16" fill="#9cc27f" opacity=".7"'+tipA("Animals with shells and skeletons: the last 539 million years")+'/>';
  /* in quiz mode the event being asked about is hidden until it is checked */
  EV.forEach(([a,n],i)=>{if(a<1)return;if(Q&&!Q.done&&Q.i===i)return;const x=sx(at(a)),up=i%2;h+='<line x1="'+x.toFixed(1)+'" x2="'+x.toFixed(1)+'" y1="'+(up?30:40)+'" y2="'+(up?40:56)+'" stroke="#1d3047" stroke-width=".6"/><circle cx="'+x.toFixed(1)+'" cy="48" r="2.4" fill="#1d3047"'+tipA(n+": about "+ageTxt(a)+", at "+clock(at(a))+" on the clock")+"/>"});
  /* the last minute, stretched out */
  h+='<g data-drag="m" class="dg-handle"><rect x="'+L0+'" y="100" width="'+(L1-L0)+'" height="22" fill="transparent"/><rect x="'+L0+'" y="104" width="'+(L1-L0)+'" height="14" rx="4" fill="#f3e7d6"/></g>'+dgT(14,114,"last minute",'font-size="7.5" font-weight="700"');
  [[-60,"23:59:00"],[-30,":30"],[0,"midnight: now"]].forEach(([s,t])=>{h+='<line x1="'+lx(s)+'" x2="'+lx(s)+'" y1="118" y2="122" stroke="#1d3047"/>'+dgT(lx(s),130,t,'text-anchor="'+(s===0?"end":"middle")+'" font-size="6.8"')});
  const LM=[[.3,"our species",96,"end"],[.012,"farming",143,"end"],[.0052,"writing",98,"end"]];
  LM.forEach(([a,n,y,an])=>{const i=EV.findIndex(e=>e[0]===a);if(Q&&!Q.done&&Q.i===i)return;const sec=-a*LS,x=lx(sec);h+='<circle cx="'+x.toFixed(1)+'" cy="111" r="2.6" fill="#c94b2c"'+tipA(n+": "+Math.abs(sec).toFixed(sec>-1?2:1)+" seconds before midnight")+"/>"+(n==="our species"?dgT((x-4).toFixed(1),y,n+" ("+Math.abs(sec).toFixed(1)+" s)",'text-anchor="'+an+'" font-size="7.2" font-weight="700" fill="#b23c0a"'):"")});
  h+=dgT(L1,143,"farming (0.23 s) · writing (0.1 s)",'text-anchor="end" font-size="7.2" font-weight="700" fill="#b23c0a"');
  /* the answer, after a check */
  if(Q&&Q.done){const a=EV[Q.i][0],x=sx(at(a));h+='<path d="M'+x.toFixed(1)+',58l-4,7h8z" fill="#2f9a5a"/><circle cx="'+x.toFixed(1)+'" cy="48" r="3.4" fill="#2f9a5a" stroke="#fff" stroke-width="1"/>';if(a<1){const xl=lx(-a*LS);h+='<circle cx="'+xl.toFixed(1)+'" cy="111" r="3.6" fill="#2f9a5a" stroke="#fff" stroke-width="1"/>'}}
  /* the flag, on the day and (in the last minute) on the strip */
  h+='<g class="dg-handle" data-drag="h"><rect x="'+(sx(hh)-8)+'" y="30" width="16" height="34" fill="transparent"/><path d="M'+sx(hh).toFixed(1)+',38l-5,-7h10z" fill="#e0662b"/><line x1="'+sx(hh).toFixed(1)+'" x2="'+sx(hh).toFixed(1)+'" y1="38" y2="58" stroke="#e0662b" stroke-width="1.6"/></g>';
  if(hh>=24-1/60){const x=lx((hh-24)*3600);h+='<g class="dg-handle" data-drag="m"><rect x="'+(x-8)+'" y="98" width="16" height="24" fill="transparent"/><path d="M'+x.toFixed(1)+',103l-4.5,-6h9z" fill="#e0662b"/><line x1="'+x.toFixed(1)+'" x2="'+x.toFixed(1)+'" y1="103" y2="119" stroke="#e0662b" stroke-width="1.6"/></g>'}
  const past=EV.filter((e,i)=>at(e[0])<=hh+1e-9&&!(Q&&!Q.done&&Q.i===i)).pop();
  h+=dgT(14,18,clock(hh)+" on the clock = "+ageTxt(age),'font-size="9" font-weight="800"');
  h+=dgT(14,28,Q&&!Q.done?"Where on the clock? Drag the flag, then tap Check":"Latest event so far: "+(hh>=24-1e-9?"today":past?past[1]:"the Earth forms"),'font-size="7.6"'+(Q&&!Q.done?' font-weight="700" fill="#c0561d"':""));
  /* quiz row */
  if(Q){const n=EV[Q.i][1];if(!Q.done)h+=dgT(14,161,"When did this happen? "+n,'font-size="8" font-weight="800" fill="#1d3047"');
    else{const a=EV[Q.i][0],dh=hh-at(a),s=Math.abs(dh)*3600,good=s<(a<1?3:600);h+=dgT(14,156,(good?"Spot on! ":"")+n+": "+clock(at(a))+" ("+ageTxt(a)+")",'font-size="7.8" font-weight="800" fill="'+(good?"#2f7a3a":"#1d3047")+'"')+dgT(14,166,"Your flag was "+offTxt(dh)+(dh>0?" too late":" too early")+" · score "+S.score[0]+" of "+S.score[1],'font-size="7.2" fill="#5b6b80"')}
    h+=btn(Q.done?"quiz":"check",222,171,68,Q.done?"Next one":"Check",!Q.done)}
  else{h+=dgT(14,161,"Dinosaurs die at 23:39. All of recorded history fits in the last tenth of a second.",'font-size="7.4" font-weight="700"');h+=btn("quiz",222,170,68,"Quiz me")}
  dyn(svg,h)}
function pick(){const pool=EV.map((e,i)=>i).filter(i=>i>0&&(!S.q||i!==S.q.i));return pool[Math.floor(Math.random()*pool.length)]}
DG.earthday=Object.assign({},D0,{
 svg:()=>'<svg viewBox="0 0 300 190"><g class="dg-dyn"></g>'+dgT(292,10,"drag along the day",'text-anchor="end" class="dg-hint"')+"</svg>",
 init:svg=>draw(svg),_draw:svg=>draw(svg),
 drag:(svg,n,x)=>{if(n==="m")S.h=24+clamp((x-L0)/(L1-L0)*60-60,-60,0)/3600;else{S.h=clamp((x-X0)/(X1-X0)*24,0,24);if(S.h>23.995&&x>=X1)S.h=24}draw(svg)},
 act:(svg,a)=>{if(a==="quiz"){S.q={i:pick(),done:false};S.h=12;draw(svg);return true}
  if(a==="check"&&S.q&&!S.q.done){const e=EV[S.q.i],s=Math.abs(S.h-at(e[0]))*3600;S.score[1]++;if(s<(e[0]<1?3:600))S.score[0]++;S.q.done=true;draw(svg);return true}return false}});
})()}catch(e){console.error(e)}

/* ------------------------------------------------------------------ How deep the ocean goes */
try{(function(){
const D0=DG.depth;if(!D0)return;
/* the sea-floor profile index.html draws (x, depth in m): shelf, slope, abyssal plain, the Mariana Trench (Challenger
   Deep 10,935 m, GEBCO/NOAA) and the plain beyond */
const PR=[[34,150],[60,200],[82,3600],[150,4300],[196,4600],[212,10935],[228,6000],[250,5000],[290,4700]];
const floorAt=x=>{x=clamp(x,34,290);for(let i=1;i<PR.length;i++)if(x<=PR[i][0]){const a=PR[i-1],b=PR[i],u=(x-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*u}return PR[PR.length-1][1]};
/* the sub can only sink as far as the floor just under it (the drawing is not to scale, so the hull may touch the trench walls) */
const room=x=>{let m=1e9;for(let dx=-1;dx<=1;dx+=1)m=Math.min(m,floorAt(x+dx));return m-120};
const S={x:274,d:1200,max:0};
function set(svg){const top=D0._top||14,k=(D0._H||156)/11e3,x=S.x,d=S.d,y=top+d*k;S.max=Math.max(S.max,d);
  const s=svg.querySelector(".dg-sub");if(s)s.setAttribute("transform","translate("+x.toFixed(1)+","+y.toFixed(1)+")");
  const t=svg.querySelector(".dg-sub-t");if(t){t.setAttribute("x1",x.toFixed(1));t.setAttribute("x2",x.toFixed(1));t.setAttribute("y2",(y-5).toFixed(1))}
  /* zones after NOAA Ocean Explorer: sunlit (epipelagic) to 200 m, twilight to 1,000 m, midnight to 4,000 m, the abyss
     to 6,000 m, and the hadal zone (the trenches) below */
  const zone=d<200?"sunlit zone":d<1e3?"twilight zone":d<4e3?"midnight zone: no sunlight":d<6e3?"the abyss":d>10300?"the bottom of the Challenger Deep":"hadal zone: inside a trench";
  const ro=svg.querySelector(".dg-ro"),ro2=svg.querySelector(".dg-ro2");
  const left=x>150,rx=left?x-14:x+14,an=left?"end":"start";
  [ro,ro2].forEach(e=>{if(e){e.setAttribute("x",rx.toFixed(1));e.setAttribute("text-anchor",an)}});
  if(ro)ro.textContent=fmt(Math.round(d/10)*10)+" m · "+zone;
  if(ro2)ro2.textContent=d<5?"at the surface":d>10300?"pressure "+fmt(1+d/10.06)+"× the surface · Trieste got here in 1960":"water pressure "+dgNice(1+d/10.06)+"× the air at the surface";
  const hint=svg.querySelector(".dg-hint");if(hint){const atFloor=d>=room(x)-5;hint.textContent=d>10300?"you reached the deepest point on Earth":atFloor&&floorAt(x)<7000?"you hit the sea floor: steer sideways into the trench":"drag the submarine down and sideways"}}
DG.depth=Object.assign({},D0,{
 init:svg=>set(svg),_set:(svg,d)=>{S.d=clamp(d,0,room(S.x));set(svg)},
 drag:(svg,n,x,y)=>{const top=D0._top||14,k=(D0._H||156)/11e3;S.x=clamp(x,40,288);S.d=clamp((y-top)/k,0,room(S.x));set(svg)}});
})()}catch(e){console.error(e)}
/* ------------------------------------------------------------------ guess first, then see the chart
   Four charts whose point is a surprise get a one-tap guess before they are shown. The answers are the charts' own
   figures (sources on each chart). "Just show me" skips. */
try{(function(){
const Q={
 deadly:["Which animal kills the most people each year?",["Sharks","Crocodiles","Snakes","Mosquitoes"],3,"Mosquitoes, by far: malaria alone killed about 597,000 people in 2023 (WHO). Sharks kill about 6."],
 deserts:["Which is the biggest desert on Earth?",["Sahara","Gobi","Antarctica","Arabian"],2,"Antarctica: a desert is a place with very little rain or snow, not a hot place. It is about 14 million km², half as big again as the Sahara."],
 cleopatra:["Did Cleopatra live closer in time to the building of the Great Pyramid, or to the Moon landing?",["The Great Pyramid","The Moon landing"],1,"The Moon landing: about 2,040 years after her birth. The Great Pyramid was already about 2,490 years old when she was born."],
 amazon:["The Amazon pours the most water into the sea. How many times as much as the Congo, the next biggest?",["About twice","About 5 times","About 20 times"],1,"About 5 times: roughly 209,000 cubic metres a second against 41,000."]};
const ACC="#e8701a",INK="#1d3047";
Object.keys(Q).forEach(k=>{const D=DG[k];if(!D||D._gq)return;const [qq,opts,ans,why]=Q[k];const svg0=D.svg,act0=D.act;
 const wrap=(t,w,max)=>{const out=[];let line="";t.split(" ").forEach(x=>{if((line+" "+x).trim().length>max){out.push(line);line=x}else line=(line+" "+x).trim()});if(line)out.push(line);return out};
 D._gq=1;
 D.svg=a=>{let s=svg0(a);const m=/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/.exec(s);if(!m)return s;const W=+m[1],H=+m[2];
  let o='<g class="gq-ov"><rect x="0" y="0" width="'+W+'" height="'+H+'" rx="6" fill="#f3f6fa" opacity=".98"/>';
  const L=wrap(qq,W,58),y0=Math.max(16,H/2-28-L.length*6);L.forEach((l,i)=>{o+=dgT(W/2,y0+i*12,esc(l),'text-anchor="middle" font-size="9.5" font-weight="800" fill="'+INK+'"')});
  const bw=opts.length>3?66:opts.length>2?84:110,gap=6,tw=opts.length*bw+(opts.length-1)*gap,bx=(W-tw)/2,by=y0+L.length*12+6;
  opts.forEach((t,i)=>{const x=bx+i*(bw+gap);o+='<g data-act="gq:'+i+'" class="gq-b gq-b'+i+'" style="cursor:pointer"><rect x="'+x+'" y="'+by+'" width="'+bw+'" height="18" rx="9" fill="#fff" stroke="'+ACC+'" stroke-width="1.4"/>'+dgT(x+bw/2,by+12.2,esc(t),'text-anchor="middle" font-size="7.6" font-weight="800" fill="'+INK+'"')+'</g>'});
  o+='<g class="gq-why"></g><g data-act="gq:skip" style="cursor:pointer">'+dgT(W/2,by+34,"just show me the chart",'text-anchor="middle" font-size="6.8" font-weight="700" fill="#5b6b80" text-decoration="underline"')+'</g></g>';
  return s.replace(/<\/svg>\s*$/,o+"</svg>")};
 D.act=(svg,a)=>{if(!/^gq:/.test(a))return act0?act0.call(D,svg,a):false;const ov=svg.querySelector(".gq-ov");if(!ov||ov._done)return true;
  const hide=()=>{ov._done=1;ov.style.transition="opacity .5s";ov.style.opacity="0";setTimeout(()=>{ov.style.display="none"},520)};
  if(a==="gq:skip"){hide();return true}
  const i=+a.slice(3),right=i===ans;ov.querySelectorAll(".gq-b").forEach((b,j)=>{const r=b.querySelector("rect"),t=b.querySelector("text");if(j===ans){r.style.fill="#2f9a5a";r.style.stroke="#2f9a5a";t.style.fill="#fff"}else if(j===i){r.style.fill="#c94b2c";r.style.stroke="#c94b2c";t.style.fill="#fff"}});
  const W=+(svg.getAttribute("viewBox")||"0 0 300").split(" ")[2]||300,b0=ov.querySelector(".gq-b rect"),by=b0?+b0.getAttribute("y")+30:100;
  const L=wrap((right?"Right! ":"Not quite. ")+why,W,70);let h="";L.forEach((l,j)=>{h+=dgT(W/2,by+j*10,esc(l),'text-anchor="middle" font-size="7.4" font-weight="'+(j?600:800)+'" fill="'+(right?"#2f7a3a":"#b23c0a")+'"')});
  const wy=ov.querySelector(".gq-why");if(wy)wy.innerHTML=h;const sk=ov.querySelector('[data-act="gq:skip"]');if(sk)sk.style.display="none";
  ov._done=1;setTimeout(()=>{ov._done=0;hide()},2600+L.length*700);return true}});
})()}catch(e){console.error(e)}
})();
