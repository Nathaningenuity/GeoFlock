/* GeoFlock: "Run the Grand Banks cod fishery" (replaces "Fish for ever, or fish it out?", key "fishery").
   Two tabs:
     You set the quota   a game. It is 1977: Canada has just taken charge of the waters 200 nautical miles off its coast and the
                         northern cod off Newfoundland have been fished down hard by factory trawlers. Each year you set the
                         quota; you see only what the scientists estimate, and their advice. Play to 2005, then the true stock
                         is shown.
     What really happened   the real catches since 1850, the quotas from 1973 and the assessed spawning stock, to the
                         moratorium of 2 July 1992.
   The model (an illustration, not a stock assessment): surplus production, B(t+1) = B + rB(1 − B/K)·d(B) − catch − M·B, with
   r = 0.35 a year and K = 3,000 thousand tonnes (most that can be caught for ever, rK/4 = 262 kt, with the stock at half of K);
   d(B) makes growth stall and then turn negative below 4% of K (too few fish to find mates and too many eaten: depensation);
   random good and bad years for young fish (log-normal, σ = 0.3). The cold years 1990–1994 (the coldest water off Newfoundland
   in decades) cut growth and add deaths. No published r and K exist for this stock; these values are consistent with about
   200 kt being caught every year for a century before 1950.
   The scientists' estimate is hyperstable, as the real one was: catch rates stayed high while the fish crowded into fewer
   places, so the estimate falls more slowly than the stock (estimate = K·(B/K)^0.6, with ±15% noise); at a quarter of K it is
   almost twice too high. Their advice catches about 15% of the estimate each year, which gives quotas close to the real ones of 1977–1991.
   Data: RAM Legacy Stock Assessment Database v4.66 (CC BY 4.0), stock COD2J3KL: catches 1850–1995 and spawning stock 1962–1995
   (DFO assessment, 2013), quotas 1973–1991 (DFO, CSAS Res. Doc. 2015/018). Moratorium announced 2 July 1992. */
(function(){
"use strict";
if(typeof DG==="undefined"||!window.GFSIM)return;
const K0=window.GFSIM,{INK,ACC,SUB,T:TX,clamp,f1,q,txt,setHTML,slider,setSlider,btn,btnOn,hint,para,setPara,make,fmt}=K0;
/* ---- data (thousand tonnes) ---- */
const DEC={1850:133,1860:166,1870:155,1880:206,1890:170,1900:206,1910:238,1920:222,1930:242,1940:190};
const C50=[272,272,265,238,304,269,301,279,221,360,459,498,645,590,677,655,518,593,812,774,503,475,459,327,368,262,197,146,132,157,170,168,225,228,227,229,244,229,265,251,215,168,41,12,1.3,.4];
const catchOf=y=>{if(y>=1950)return y<=1995?C50[y-1950]:null;const d=Math.floor(y/10)*10,a=DEC[d],b=d+10>=1950?272:DEC[d+10];return a+(b-a)*(y-d)/10};
const SSB=[1600,1380,1420,1210,990,916,890,824,666,613,610,522,447,340,211,124,113,139,222,338,406,549,471,408,996,467,615,696,468,145,48,10,3,4];/* 1962–1995; 1986 looks like an outlier in the source */
const TAC={1973:666,1974:657,1975:554,1976:300,1977:160,1978:135,1979:180,1980:180,1981:200,1982:230,1983:260,1984:266,1985:266,1986:266,1987:256,1988:266,1989:235,1990:199,1991:190};
const EVENTS={1950:"Catches near 270,000 t a year, much as for a century",1959:"Factory freezer trawlers, many from Europe, fish all year, even on the spawning shoals",1968:"The record: 812,000 t landed in one year",1977:"Canada claims 200 nautical miles: foreign fleets must leave, Canada sets the quota",1984:"Quotas around 266,000 t, set from estimates that turned out far too high",1990:"An independent review (the Harris report) warns the stock is smaller than thought and the quotas too high",1992:"2 July: the fishery is closed (the moratorium). About 30,000 people in Newfoundland and Labrador lose their work",1995:"The cod have not come back"};
/* ---- the model ---- */
const R0=.35,K=3000,MDEP=.04,Y1=1977,YE=2005,B0=800;
function rng(seed){let s=seed%2147483646+1;return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function gauss(r){return Math.sqrt(-2*Math.log(r()+1e-9))*Math.cos(6.2832*r())}
const estOf=(B,e)=>K*Math.pow(Math.max(B,0)/K,.6)*e;
function newGame(seed){const r=rng(seed||((Date.now()%100000)+7));const g={r,y:Y1,B:B0,yrs:[],quota:200,over:false,coll:0,msg:EVENTS[1977]};g.est=estOf(B0,Math.exp(.15*gauss(r)));g.adv=Math.round(g.est*.15/5)*5;return g}
function step(g,quota){if(g.over)return;const y=g.y,B=g.B,x=B/K;let rr=R0,M=0,ev="";if(y>=1990&&y<=1994){rr=R0*.4;M=.15}
 const cat=Math.min(quota,B*.8),G=rr*B*(1-x)*clamp((x-MDEP)/MDEP,-1,1)*Math.exp(.3*gauss(g.r)-.045);
 const B1=Math.max(0,B+G-cat-M*B);g.yrs.push({y,quota,cat,B,est:g.est,adv:g.adv});g.B=B1;g.y=y+1;
 if(y===1990)ev="The water off Newfoundland turns the coldest in decades: fewer young cod survive, more fish die.";
 if(B1<MDEP*K&&!g.coll){g.coll=g.y;ev="The boats come back nearly empty: the cod have collapsed. The fishery must close."}
 g.est=estOf(B1,Math.exp(.15*gauss(g.r)));g.adv=g.coll?0:Math.round(g.est*.15/5)*5;
 g.msg=ev||(quota<(g.yrs.length>1?g.yrs[g.yrs.length-2].quota:200)*.8?"Fishing towns protest the cut: boats sit idle and plants close.":quota>g.adv*1.15?"The fleet is happy; the scientists say the quota is above their advice.":"");
 if(g.y>YE)g.over=true}
/* ---- drawing helpers ---- */
const CX0=34,CX1=292,TOP=28,BOT=118;
const xOf=(y,a,b)=>CX0+(y-a+.5)/(b-a+1)*(CX1-CX0);
const yOf=(v,hi)=>BOT-clamp(v,0,hi*1.05)/hi*(BOT-TOP);
function axes(a,b,hi,ticks,xs){let h='<clipPath id="dgCdClip"><rect x="'+CX0+'" y="'+TOP+'" width="'+(CX1-CX0)+'" height="'+(BOT-TOP)+'"/></clipPath><rect x="'+CX0+'" y="'+TOP+'" width="'+(CX1-CX0)+'" height="'+(BOT-TOP)+'" rx="4" fill="#eef4f9"/>';
 ticks.forEach(v=>{const y=f1(yOf(v,hi));h+='<line x1="'+CX0+'" x2="'+CX1+'" y1="'+y+'" y2="'+y+'" stroke="#dbe4ee" stroke-width=".5"/>'+TX(CX0-2,+y+2,v>=1000?(v/1000)+"M t":v?v+"k t":"0",'font-size="5.2" text-anchor="end" fill="'+SUB+'"')});
 for(let y=Math.ceil(a/xs)*xs;y<=b;y+=xs)h+=TX(f1(xOf(y,a,b)),BOT+6.5,y,'font-size="5.2" text-anchor="middle" fill="'+SUB+'"');return h}
const path=(pts,a,b,hi)=>pts.map((p,i)=>(i?"L":"M")+f1(xOf(p[0],a,b))+","+f1(yOf(p[1],hi))).join("");
function bars(list,a,b,hi,col,op){const w=Math.max(.6,(CX1-CX0)/(b-a+1)*.78);return list.map(([y,v])=>v==null?"":'<rect x="'+f1(xOf(y,a,b)-w/2)+'" y="'+f1(yOf(v,hi))+'" width="'+f1(w)+'" height="'+f1(BOT-yOf(v,hi))+'" fill="'+col+'" opacity="'+(op||1)+'"/>').join("")}
const LEG=(x,col,l,dash,bar)=>'<g transform="translate('+x+','+(TOP+15)+')">'+(bar?'<rect y="-2.5" width="6" height="5" fill="'+col+'"/>':'<line x2="9" stroke="'+col+'" stroke-width="1.4"'+(dash?' stroke-dasharray="2.5 1.5"':'')+'/>')+TX(bar?8:11,2,l,'font-size="5.2" fill="'+SUB+'"')+'</g>';
/* ---- the simulation ---- */
const GA=1950,GB=YE,HI=2600,HH=2000;
make("fishery",{title:"Run the Grand Banks cod fishery",cat:"econ",h:252,tabs:["You set the quota","What really happened"],tabFrames:true,
 src:"Game model: surplus production (r = 0.35/yr, K = 3 million t, depensation below 4% of K, random recruitment, the cold years 1990–94) with a hyperstable survey estimate, an illustration rather than an assessment. Real data: RAM Legacy Stock Assessment Database v4.66 (CC BY 4.0), northern cod 2J3KL: catches 1850–1995, spawning stock 1962–1995 (DFO 2013), quotas 1973–1991 (DFO 2015). Moratorium 2 July 1992 (Fisheries and Oceans Canada).",
 frame:tab=>{
  if(tab===0)return axes(GA,GB,HI,[0,500,1000,1500,2000,2500],10)+'<rect x="'+f1(xOf(Y1,GA,GB)-2)+'" y="'+TOP+'" width="'+f1(CX1-xOf(Y1,GA,GB)+2)+'" height="'+(BOT-TOP)+'" fill="#fff6ea" opacity=".7"/>'+
   '<g clip-path="url(#dgCdClip)"><g class="cd-bars"></g><path class="cd-est" fill="none" stroke="#2f7ab8" stroke-width="1.6"/><path class="cd-true" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-dasharray="3 1.6"/><line class="cd-k2" x1="'+CX0+'" x2="'+CX1+'" stroke="#2e9b5f" stroke-width=".6" stroke-dasharray="2 2"/></g><text class="cd-k2t" x="'+(CX1-2)+'" font-size="4.8" text-anchor="end" fill="#2e7d4f">half the natural stock: where the most can be caught for ever</text><g class="cd-now"></g>'+
   TX(CX0+4,TOP+8,"Northern cod off Newfoundland, thousand tonnes",'font-size="6" font-weight="800" fill="'+INK+'"')+LEG(CX0+4,"#b7c1cd","catch before you",0,1)+LEG(CX0+56,ACC,"your catch",0,1)+LEG(CX0+96,"#2f7ab8","scientists’ estimate")+'<g class="cd-legT">'+LEG(CX0+160,"#c0392b","true stock",1)+'</g>'+
   slider("q",CX0,138,150,"Your quota for the year")+btn("adv",192,128,100,"Take the advice")+btn("next",CX0,150,74,"Next year ▶")+btn("run",CX0+78,150,72,"5 years ▶▶")+btn("reveal",192,150,100,"Peek at the true stock")+btn("new",192,168,100,"Start over")+
   '<text class="cd-big" x="'+CX0+'" y="194" font-size="7.6" font-weight="900" fill="'+INK+'"></text>'+para("cd-tx",CX0-2,197,262,44,6.1)+hint(CX0,249,"Set the quota, then Next year; you only see the scientists’ estimate");
  return axes(1850,1995,HH,[0,500,1000,1500],25)+'<g clip-path="url(#dgCdClip)"><g class="cd-hbars"></g><path class="cd-hssb" fill="none" stroke="#2f7ab8" stroke-width="1.6"/><path class="cd-htac" fill="none" stroke="#2e9b5f" stroke-width="1.3" stroke-dasharray="3 1.5"/></g><line x1="'+f1(xOf(1992,1850,1995))+'" x2="'+f1(xOf(1992,1850,1995))+'" y1="'+TOP+'" y2="'+BOT+'" stroke="#c0392b" stroke-width=".8"/>'+TX(f1(xOf(1992,1850,1995)-2),TOP+30,"1992: closed",'font-size="5.2" font-weight="800" text-anchor="end" fill="#c0392b"')+'<g class="cd-hcur"></g>'+
   TX(CX0+4,TOP+8,"Northern cod: what really happened (thousand tonnes)",'font-size="6" font-weight="800" fill="'+INK+'"')+LEG(CX0+4,"#8a6a4f","catch",0,1)+LEG(CX0+36,"#2f7ab8","spawning stock (assessed)")+LEG(CX0+120,"#2e9b5f","quota",1)+
   '<text class="cd-big" x="'+CX0+'" y="134" font-size="7.6" font-weight="900" fill="'+INK+'"></text>'+para("cd-tx",CX0-2,137,262,96,6.2)+hint(CX0,249,"Point at a year")},
 state:()=>({g:newGame(),q:200,peek:false,hov:null}),
 draw:(svg,s)=>{
  if(s.tab===0){const g=s.g,Y=g.yrs,show=s.peek||g.over||g.coll;
   let b=bars(Array.from({length:Y1-GA},(_,i)=>[GA+i,catchOf(GA+i)]),GA,GB,HI,"#b7c1cd")+bars(Y.map(r=>[r.y,r.cat]),GA,GB,HI,ACC);setHTML(svg,".cd-bars",b);
   const est=Y.map(r=>[r.y,r.est]).concat(g.over?[]:[[g.y,g.est]]),tru=Y.map(r=>[r.y,r.B]).concat([[Math.min(g.y,YE),g.B]]);
   q(svg,".cd-est").setAttribute("d",est.length>1?path(est,GA,GB,HI):"");q(svg,".cd-true").setAttribute("d",show&&tru.length>1?path(tru,GA,GB,HI):"");
   const k2=q(svg,".cd-k2");k2.setAttribute("y1",f1(yOf(K/2,HI)));k2.setAttribute("y2",f1(yOf(K/2,HI)));k2.style.display=show?"":"none";const kt=q(svg,".cd-k2t");kt.setAttribute("y",f1(yOf(K/2,HI)-1.5));kt.style.display=show?"":"none";q(svg,".cd-legT").style.display=show?"":"none";
   setHTML(svg,".cd-now",g.over?"":'<line x1="'+f1(xOf(g.y,GA,GB))+'" x2="'+f1(xOf(g.y,GA,GB))+'" y1="'+TOP+'" y2="'+BOT+'" stroke="'+INK+'" stroke-width=".5" stroke-dasharray="1.5 1.5"/>');
   setSlider(svg,"q",CX0,138,150,s.q/500,fmt(s.q)+" thousand t");btnOn(svg,"reveal",s.peek,s.peek?"Hide the true stock":"Peek at the true stock");btnOn(svg,"adv",false,g.coll?"Advice: close it":"Take the advice: "+g.adv+"k t");
   const tot=Y.reduce((a,r)=>a+r.cat,0);
   if(g.over){const real=C50.slice(Y1-1950,1996-1950).reduce((a,v)=>a+v,0),pct=Math.round(g.B/K*100);
    txt(svg,".cd-big","2005: you landed "+fmt(tot)+" thousand t · cod left: "+pct+"% of the natural stock");
    setPara(svg,"cd-tx",(g.coll?"The stock collapsed in "+g.coll+" and has not come back: below a few per cent the cod cannot recover even with no fishing. ":pct>=40?"The cod are healthy: you could have kept fishing for ever. ":"The cod survived, but only just. ")+"The real fishery landed "+fmt(real)+" thousand t from 1977 to 1995, nearly all before the 1992 closure; the most that can be caught for ever in this model is 262 thousand t a year, with the stock at half its natural size (green line). The scientists’ estimate (blue) stayed high while the true stock (red) fell: the fish crowded into fewer places, so catch rates hardly dropped.")}
   else{txt(svg,".cd-big",g.y+": scientists estimate "+fmt(g.est)+" thousand t");
    setPara(svg,"cd-tx",(EVENTS[g.y]&&!g.msg?EVENTS[g.y]+". ":"")+(g.msg?g.msg+" ":"")+(Y.length?"Last year you landed "+fmt(Y[Y.length-1].cat)+" thousand t. ":"Before 1977, foreign trawlers took up to 800 thousand t a year (grey). ")+"Their advice: "+(g.coll?"close the fishery.":g.adv+" thousand t.")+(s.peek?" True stock: "+fmt(g.B)+" thousand t.":""))}
   ["next","run"].forEach(k=>btnOn(svg,k,false));}
  else{let b="";for(let y=1850;y<=1995;y++){const v=catchOf(y);if(v!=null)b+=bars([[y,v]],1850,1995,HH,"#8a6a4f",.85)}setHTML(svg,".cd-hbars",b);
   q(svg,".cd-hssb").setAttribute("d",path(SSB.map((v,i)=>[1962+i,v]),1850,1995,HH));q(svg,".cd-htac").setAttribute("d",path(Object.keys(TAC).map(y=>[+y,TAC[y]]),1850,1995,HH));
   const H=s.hov;if(H!=null){const y=Math.round(H),c=catchOf(y),i=y-1962,ev=Object.keys(EVENTS).map(Number).filter(e=>e<=y).pop();
    setHTML(svg,".cd-hcur",'<line x1="'+f1(xOf(y,1850,1995))+'" x2="'+f1(xOf(y,1850,1995))+'" y1="'+TOP+'" y2="'+BOT+'" stroke="'+INK+'" stroke-width=".5" stroke-dasharray="1.5 1.5"/>');
    txt(svg,".cd-big",y+": catch "+(c==null?"—":fmt(c))+" thousand t"+(TAC[y]?" · quota "+TAC[y]:"")+(i>=0&&i<SSB.length?" · spawning stock "+fmt(SSB[i]):""));setPara(svg,"cd-tx",(y<1950?"Before 1950 the catch is known only roughly (shown every ten years, joined up). ":"")+(ev?"<b>"+ev+"</b>: "+EVENTS[ev]+".":""))}
   else{setHTML(svg,".cd-hcur","");txt(svg,".cd-big","1850–1950 steady, 1968 a record, 1992 closed");
    setPara(svg,"cd-tx","For a century boats took about 200 thousand t of cod a year off Newfoundland. From 1959 factory freezer trawlers took far more, 812 thousand t in 1968, and the spawning stock fell to less than a tenth. Canada took control in 1977 and set quotas (green) from estimates that later proved far too high; the stock recovered a little, then crashed. On 2 July 1992 the fishery was closed; about 30,000 people lost their work, the largest industrial closure in Canadian history. Recovery has been slow: decades later the stock is still far smaller than in the 1960s.")}}},
 drag:(svg,s,n,x)=>{if(n==="q"){s.q=Math.round(clamp((x-CX0)/150,0,1)*500/5)*5}},
 move:(svg,s,x,y)=>{if(s.tab!==1)return false;if(x<CX0||x>CX1||y<TOP||y>BOT){if(s.hov==null)return false;s.hov=null;return}s.hov=1850+(x-CX0)/(CX1-CX0)*146-.5},
 leave:(svg,s)=>{if(s.hov==null)return false;s.hov=null},
 act:(svg,s,a)=>{const g=s.g;
  if(a==="adv"){s.q=g.adv;return true}
  if(a==="next"){if(g.over)return true;step(g,g.coll?0:s.q);if(g.coll)s.q=0;return true}
  if(a==="run"){for(let i=0;i<5&&!g.over;i++){step(g,g.coll?0:s.q);if(g.coll)s.q=0}return true}
  if(a==="reveal"){s.peek=!s.peek;return true}
  if(a==="new"){s.g=newGame();s.q=200;s.peek=false;return true}}});
})();
