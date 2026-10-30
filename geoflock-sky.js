/* GeoFlock: the Sky theme backgrounds (from the user's sky scenes): night, the Milky Way over a silhouetted landscape;
   day, cumulus clouds and small flocks over a green alpine valley with a lake. Drawn once per screen size into #skyField. */
(function(){const st=document.createElement("style");st.textContent=`
/* ===== Sky backgrounds: a landscape along the bottom; the Milky Way by night, clouds and a flock by day ===== */
  body.sky-theme:not(.sky-night) #gfDayClouds{ display:block; position:absolute; inset:0; width:100%; height:100%; pointer-events:none; animation:gfDrift 180s ease-in-out infinite alternate; }
  @keyframes gfDrift{ from{ transform:translateX(-2.5vw); } to{ transform:translateX(2.5vw); } }
  @media (prefers-reduced-motion: reduce){ body.sky-theme:not(.sky-night) #gfDayClouds{ animation:none; } }
  #gfNightLand canvas, #gfDayLand canvas{ display:block; }
  body.sky-theme.sky-night #gfNightGalaxy{ display:block; position:absolute; inset:0; width:100%; height:100%; pointer-events:none; mix-blend-mode:screen; }
  body.sky-theme.sky-night #gfNightLand,
  body.sky-theme:not(.sky-night) #gfDayLand{ display:block; position:absolute; left:0; right:0; bottom:0; height:min(28vh,250px); z-index:1; pointer-events:none; }
  body.sky-theme:not(.sky-night) .sky-field > span{ display:none; }
  body.sky-theme:not(.sky-night) #gfDaySky{ display:block; position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
  body.sky-theme:not(.sky-night) #gfBirds{ display:block; position:absolute; inset:0; pointer-events:none; overflow:hidden; }
  #gfBirds{ display:none; } .gf-birds{ position:absolute; left:-140px; opacity:.55; animation:gfBirdFly linear infinite; }
  .gfBirdB{ opacity:.4; animation-delay:-60s; transform:scale(.7); } .gfBirdC{ opacity:.35; animation-delay:-25s; }
  @keyframes gfBirdFly{ from{ transform:translate3d(0,0,0); } 50%{ transform:translate3d(55vw,-3vh,0); } to{ transform:translate3d(calc(100vw + 280px),1vh,0); } }
  @media (prefers-reduced-motion: reduce){ .gf-birds{ animation:none; display:none; } }
`;document.head.appendChild(st)})();

/* GeoFlock sky backgrounds. Two scenes, each drawn once per screen size into #skyField:
   night: the Milky Way over a silhouetted landscape (snow-tipped ranges, misty valleys, a lake and river, forest);
   day: soft clouds over a green alpine valley (snowy peaks, a waterfall, wooded hills, a winding stream, a meadow). */
(function(){
/* ---------- Milky Way, generated once per screen size ---------- */
function hash(x,y){let h=(x*374761393+y*668265263)^0x5bd1e995;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y,o){let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*vnoise(x*f,y*f);f*=2.03;a*=.5}return s}
let rnd=1;const rand=()=>(rnd=Math.imul(rnd^(rnd>>>15),2246822507)+0x9e3779b9>>>0,rnd/4294967296);
function drawGalaxy(cv){
  const dpr=Math.min(2,window.devicePixelRatio||1),W=innerWidth,H=innerHeight;
  cv.width=W*dpr;cv.height=H*dpr;const ctx=cv.getContext("2d");ctx.clearRect(0,0,cv.width,cv.height);
  /* the band: an arch from lower left to upper right */
  const ax=-0.12*W,ay=1.08*H,bx=1.12*W,by=-0.18*H,dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,wid=0.11*Math.hypot(W,H);
  const band=(x,y)=>{const t=((x-ax)*dx+(y-ay)*dy)/(L*L),arch=0.10*L*(t-0.5)*(t-0.5)-0.025*L;
    const d=((x-ax)*nx+(y-ay)*ny)+arch;return[t,d]};
  const sc=0.4,w=Math.ceil(W*sc),h=Math.ceil(H*sc),off=document.createElement("canvas");off.width=w;off.height=h;
  const oc=off.getContext("2d"),img=oc.createImageData(w,h),D=img.data,k=3/Math.max(W,H);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){
    const x=i/sc,y=j/sc,[t,d]=band(x,y),core=Math.exp(-Math.pow((t-0.34)/0.16,2)),ww=wid*(1+0.7*core);
    let g=Math.exp(-(d*d)/(2*ww*ww));if(g<0.004)continue;
    const n=fbm(x*k*2.2,y*k*2.2,5),n2=fbm(x*k*6+40,y*k*6,4);
    let I=g*(0.35+0.9*n)*(0.55+0.9*core);
    const lane=Math.exp(-Math.pow((d+0.12*ww*(n2-0.5)*4-0.08*ww)/(0.20*ww),2));I*=1-0.75*lane*Math.min(1,0.4+n2);
    I=Math.max(0,I)*0.9;
    const warm=core*Math.exp(-(d*d)/(2*(ww*0.6)**2));
    const r=150+80*warm,gg=150+55*warm-10*(1-warm),b=225-45*warm,p=(j*w+i)*4;
    D[p]=r;D[p+1]=gg;D[p+2]=b;D[p+3]=Math.min(255,I*112)}
  oc.putImageData(img,0,0);ctx.imageSmoothingQuality="high";ctx.drawImage(off,0,0,cv.width,cv.height);
  /* stars, crowded into the band */
  ctx.save();ctx.scale(dpr,dpr);rnd=12345;const N=Math.round(W*H/520);
  for(let s=0;s<N;s++){const x=rand()*W,y=rand()*H,[,d]=band(x,y),g=Math.exp(-(d*d)/(2*(wid*1.25)**2));
    if(rand()>0.18+0.82*g)continue;
    const m=rand(),r=m<0.92?0.35+rand()*0.6:0.9+rand()*0.9,a=0.25+rand()*0.6,tint=rand();
    const col=tint<0.12?`rgba(255,226,196,${a})`:tint<0.3?`rgba(196,212,255,${a})`:`rgba(255,255,255,${a})`;
    if(r>1.2){const gr=ctx.createRadialGradient(x,y,0,x,y,r*5);gr.addColorStop(0,`rgba(220,226,255,${a*0.35})`);gr.addColorStop(1,"rgba(220,226,255,0)");ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,r*5,0,7);ctx.fill()}
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
  ctx.restore()}

/* ---------- a silhouetted night landscape: ranges fading into haze, misty valleys, a lake, pines ---------- */
function n1(x,seed){return vnoise(x,seed*7.13)}
function ridged(x,seed,o){let s=0,a=.5,f=1,norm=0;for(let i=0;i<o;i++){const v=1-Math.abs(2*n1(x*f,seed+i*3.7)-1);s+=a*v*v;norm+=a;f*=2.1;a*=.52}return s/norm}
function smooth(x,seed,o){let s=0,a=.5,f=1,norm=0;for(let i=0;i<o;i++){s+=a*n1(x*f,seed+i*5.1);norm+=a;f*=2;a*=.5}return s/norm}
function pine(ctx,x,y,h,lean){const w=h*0.36;ctx.beginPath();ctx.moveTo(x-w*0.08,y+2);ctx.lineTo(x+w*0.08,y+2);ctx.lineTo(x+w*0.07,y-h*0.18);
  const tiers=3+Math.floor(h/14);for(let t=0;t<tiers;t++){const f0=t/tiers,f1=(t+1)/tiers,yy0=y-h*(0.12+0.88*f0),yy1=y-h*(0.12+0.88*f1),ww=w*(1-f0*0.82)*(0.5+0.5*((t%2)?0.82:1));
    ctx.lineTo(x+ww/2+lean*f0*h*0.1,yy0);ctx.lineTo(x+lean*f1*h*0.1+w*0.06,yy1+h*0.10)}
  ctx.lineTo(x+lean*h*0.1,y-h);
  for(let t=tiers-1;t>=0;t--){const f0=t/tiers,f1=(t+1)/tiers,yy0=y-h*(0.12+0.88*f0),yy1=y-h*(0.12+0.88*f1),ww=w*(1-f0*0.82)*(0.5+0.5*((t%2)?0.82:1));
    ctx.lineTo(x+lean*f1*h*0.1-w*0.06,yy1+h*0.10);ctx.lineTo(x-ww/2+lean*f0*h*0.1,yy0)}
  ctx.lineTo(x-w*0.07,y-h*0.18);ctx.closePath();ctx.fill()}
function roundTree(ctx,x,y,h){ctx.beginPath();ctx.rect(x-h*0.04,y-h*0.4,h*0.08,h*0.42);ctx.fill();
  for(const[dx,dy,r] of [[0,-0.62,0.30],[-0.18,-0.5,0.22],[0.19,-0.52,0.23],[0,-0.82,0.2]]){ctx.beginPath();ctx.arc(x+dx*h,y+dy*h,r*h,0,7);ctx.fill()}}
function drawLand(host,P){
  let cv=host.querySelector("canvas");if(!cv){cv=document.createElement("canvas");host.appendChild(cv)}
  const dpr=Math.min(2,devicePixelRatio||1),W=host.clientWidth||innerWidth,H=host.clientHeight||220;
  cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+"px";cv.style.height=H+"px";
  const ctx=cv.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);rnd=777;
  const S=1/Math.max(W,900),G=(c,w)=>x=>Math.exp(-Math.pow((x-c*W)/(w*W),2)),sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
  const narrow=W<700, vc=(narrow?0.5:0.56)*W, valley=G(vc/W,narrow?0.2:0.11), edge=x=>Math.pow(Math.abs(x/W-0.5)*2,narrow?1.6:3);
  const layers=[
    {f:x=>H*0.46-H*0.46*Math.pow(ridged(x*S*3.4,1,7),1.6)*(0.55+0.45*G(0.12,0.18)(x)+0.35*G(0.93,0.1)(x))-H*0.05*ridged(x*S*14,3,3)+H*0.10*G(0.5,0.12)(x),col:P.c[0],rim:.22,snow:H*0.30},
    {f:x=>H*0.56-H*0.24*ridged(x*S*3.2,11,6)+H*0.08*valley(x),col:P.c[1],rim:.15},
    {f:x=>H*0.68-H*0.17*(0.6*ridged(x*S*4.5,21,5)+0.4*smooth(x*S*2.5,22,4))+H*0.12*valley(x),col:P.c[2],rim:.07,trees:{min:3,max:6,p:.35}},
    {water:H*0.80},
    {f:x=>H*0.76-H*0.12*smooth(x*S*4.5,31,5)-H*0.04*ridged(x*S*12,32,3)+H*0.26*valley(x),col:P.c[3],trees:{min:5,max:12,p:.55},river:true},
    {f:x=>H*(1.06-0.42*edge(x))-H*0.07*smooth(x*S*7,41,4),col:P.c[4],trees:{min:9,max:24,p:.6,round:.2}}];
  for(const L of layers){
    if(L.water){const y0=L.water,g=ctx.createLinearGradient(0,y0,0,H);g.addColorStop(0,P.w[0]);g.addColorStop(.4,P.w[1]);g.addColorStop(1,P.w[2]);
      ctx.fillStyle=g;ctx.fillRect(0,y0,W,H-y0);ctx.strokeStyle=P.ripple;ctx.lineWidth=1;
      for(let i=0;i<8;i++){const y=y0+3+i*4,x=vc+(rand()-0.5)*W*0.12,l=8+rand()*40;ctx.beginPath();ctx.moveTo(x-l/2,y);ctx.lineTo(x+l/2,y);ctx.stroke()}continue}
    const ys=[];for(let x=0;x<=W;x+=2)ys.push(L.f(x));const path=()=>{ctx.beginPath();ctx.moveTo(0,H);ys.forEach((y,i)=>ctx.lineTo(i*2,y));ctx.lineTo(W,H);ctx.closePath()};
    ctx.fillStyle=L.col;path();ctx.fill();
    if(L.snow){ctx.save();path();ctx.clip();const g=ctx.createLinearGradient(0,0,0,L.snow);g.addColorStop(0,P.snow);g.addColorStop(1,P.snow0);
      ctx.fillStyle=g;ctx.fillRect(0,0,W,L.snow);ctx.restore()}
    if(L.rim){ctx.strokeStyle=P.rim(L.rim);ctx.lineWidth=1;ctx.beginPath();ys.forEach((y,i)=>i?ctx.lineTo(i*2,y):ctx.moveTo(0,y));ctx.stroke()}
    if(L.river){/* a river winding from the lake toward the viewer; it starts at the near shore, so it is drawn on the land only */
      ctx.save();path();ctx.clip();const pts=[];for(let i=0;i<=40;i++){const t=i/40,y=H*0.80+t*(H*0.22),x=vc+Math.sin(t*5.2+0.6)*W*(narrow?0.07:0.035)*t*1.6+t*W*0.02;pts.push([x,y,1.5+t*t*16])}
      const g=ctx.createLinearGradient(0,H*0.8,0,H);g.addColorStop(0,P.w[0]);g.addColorStop(1,P.w[1]);ctx.fillStyle=g;
      ctx.beginPath();pts.forEach(([x,y,w],i)=>i?ctx.lineTo(x-w,y):ctx.moveTo(x-w,y));pts.slice().reverse().forEach(([x,y,w])=>ctx.lineTo(x+w,y));ctx.closePath();ctx.fill();
      ctx.strokeStyle=P.ripple;for(let i=6;i<40;i+=5){const[x,y,w]=pts[i];ctx.beginPath();ctx.moveTo(x-w*0.5,y);ctx.lineTo(x+w*0.3,y);ctx.stroke()}ctx.restore()}
    if(L.trees){if(P.tree)ctx.fillStyle=P.tree(L.col);/* trees grow in patches: woods, then open ground */
      const T=L.trees;let x=rand()*10;while(x<W){const i=Math.min(ys.length-1,Math.round(x/2)),y=ys[i],patch=smooth(x*S*5,90+T.min,3);
        if(y<H-2&&patch>(P.patch||0.52)&&rand()<T.p*(P.lush||1)){const h=(T.min+rand()*(T.max-T.min))*(0.7+0.5*patch);
          if(T.round&&rand()<T.round)roundTree(ctx,x,y+1,h*0.75);else pine(ctx,x,y+2,h,(rand()-0.5)*0.5)}
        x+=T.min*(0.35+rand()*1.4)}}
    const mist=ctx.createLinearGradient(0,Math.min(...ys),0,H);mist.addColorStop(0,P.mist0);mist.addColorStop(1,P.mist);ctx.fillStyle=mist;ctx.fillRect(0,0,W,H)}
}


function poplar(ctx,x,y,h){ctx.beginPath();ctx.ellipse(x,y-h*0.55,h*0.13,h*0.5,0,0,7);ctx.fill();ctx.fillRect(x-0.6,y-h*0.08,1.2,h*0.1)}
function grove(ctx,x,y,size,n){for(let i=0;i<n;i++){const dx=(rand()-0.5)*size*n*0.55,h=size*(0.7+rand()*0.6);
  if(rand()<0.18)poplar(ctx,x+dx,y+rand()*2,h*1.3);else roundTree(ctx,x+dx,y+1+rand()*2,h)}}
function drawDayLand(host){
  /* a green alpine scene, separate from the night one: a snowy high range with cloud on its shoulders, a waterfall
     down a cliff, forested hills around a valley with a winding stream,
     and a meadow foreground with groves */
  let cv=host.querySelector("canvas");if(!cv){cv=document.createElement("canvas");host.appendChild(cv)}
  const dpr=Math.min(2,devicePixelRatio||1),Wc=host.clientWidth||innerWidth,H=host.clientHeight||220;
  cv.width=Wc*dpr;cv.height=H*dpr;cv.style.width=Wc+"px";cv.style.height=H+"px";
  const ctx=cv.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,Wc,H);rnd=2024;
  const W=Math.max(Wc,760);ctx.translate(-(W-Wc)*0.45,0);
  const S=1/Math.max(W,900),X=f=>f*W,Y=f=>f*H,G=(c,w)=>x=>Math.exp(-Math.pow((x-c*W)/(w*W),2));
  const shade=(c,k)=>{const n=parseInt(c.slice(1),16),f=v=>Math.round(v*k);return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`};
  const prof=f=>{const p=[];for(let x=0;x<=W+2;x+=2)p.push(f(x));return p},at=(p,x)=>p[Math.max(0,Math.min(p.length-1,Math.round(x/2)))];
  const shape=(p,flip)=>{ctx.beginPath();ctx.moveTo(0,flip!=null?flip:H);p.forEach((y,i)=>ctx.lineTo(i*2,y));ctx.lineTo(W,flip!=null?flip:H);ctx.closePath()};
  const fill=(p,col)=>{ctx.fillStyle=col;shape(p);ctx.fill()};
  const rim=(p,a)=>{ctx.strokeStyle=`rgba(255,252,240,${a})`;ctx.lineWidth=1;ctx.beginPath();p.forEach((y,i)=>i?ctx.lineTo(i*2,y):ctx.moveTo(0,y));ctx.stroke()};
  const mistBand=(y0,hh,a,seed)=>{ctx.save();ctx.filter=`blur(${Math.max(3,hh*0.7).toFixed(1)}px)`;
      for(let x=-hh*3;x<W+hh*3;x+=hh*2.2){const m=smooth(x*S*3,seed,3);if(m<0.42)continue;
        ctx.fillStyle=`rgba(255,255,255,${Math.min(.6,a*(m-0.42)*1.6)})`;ctx.beginPath();ctx.ellipse(x,y0+(smooth(x*S*9,seed+1,2)-0.5)*hh,hh*3.4,hh*(0.45+m*0.6),0,0,7);ctx.fill()}
      ctx.restore()};
  const gradFill=(p,c0,c1)=>{const t=Math.min(...p),g=ctx.createLinearGradient(0,t,0,H);g.addColorStop(0,c0);g.addColorStop(1,c1);ctx.fillStyle=g;shape(p);ctx.fill()};
  /* light from the upper left: slopes facing right fall into soft shade, slopes facing left catch the light */
  const slopeShade=(p,depth,a)=>{const off=document.createElement("canvas");off.width=Math.ceil(W);off.height=Math.ceil(H);const oc=off.getContext("2d");
      for(let i=10;i<p.length-10;i++){let d=0;for(let k=1;k<=10;k++)d+=p[i+k]-p[i-k];const sl=Math.max(-1,Math.min(1,d/110*2.0));if(Math.abs(sl)<0.06)continue;
        const y=p[i],g=oc.createLinearGradient(0,y,0,y+depth),c=sl>0?`rgba(62,104,104,${a*sl})`:`rgba(255,252,238,${a*-sl*0.55})`;g.addColorStop(0,c);g.addColorStop(1,sl>0?"rgba(62,104,104,0)":"rgba(255,252,238,0)");
        oc.fillStyle=g;oc.fillRect(i*2-1,y,3,depth)}
      ctx.save();shape(p);ctx.clip();ctx.filter="blur(2.5px)";ctx.drawImage(off,0,0,W,H);ctx.restore()};
  /* woods: soft canopies of overlapping crowns just below a crest */
  const woods=(p,col,seed,size,thr,depth)=>{ctx.fillStyle=col;for(let x=0;x<W;x+=size*0.9){if(smooth(x*S*5,seed,3)<thr)continue;const y0=at(p,x);if(y0>H-4)continue;
      for(let k=0;k<3;k++){const yy=y0+size*1.3+rand()*depth;ctx.beginPath();ctx.arc(x+(rand()-0.5)*size,yy,size*(0.55+rand()*0.5),0,7);ctx.fill()}}};
  const lakeL=X(0.14),lakeR=X(0.54),lakeY=Y(0.74),lakeMask=x=>Math.max(0,Math.min(1,Math.min(x-lakeL,lakeR-x)/X(0.12)));
  /* 1. the high range: snow on the summits */
  const N=(r,a,b)=>Math.max(0,Math.min(1,(r-a)/(b-a)));
  const far=prof(x=>Y(0.56)-Y(0.78)*Math.pow(N(ridged(x*S*2.8,201,7),0.30,0.80),1.7)*(0.35+0.75*G(0.74,0.17)(x)+0.35*G(0.20,0.10)(x))-Y(0.05)*smooth(x*S*3,204,3)-Y(0.03)*ridged(x*S*12,202,3));
  const top=Math.min(...far);gradFill(far,"#c9dfe8","#a9cbd2");
  ctx.save();shape(far);ctx.clip();const sn=ctx.createLinearGradient(0,top,0,top+Y(0.20));sn.addColorStop(0,"rgba(255,255,255,.95)");sn.addColorStop(.6,"rgba(255,255,255,.7)");sn.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=sn;ctx.fillRect(0,0,W,top+Y(0.20));ctx.restore();slopeShade(far,Y(0.34),.22);rim(far,.6);
  ctx.save();shape(far);ctx.clip();mistBand(top+Y(0.24),Y(0.045),.85,203);ctx.restore();                                                         /* cloud on the shoulders of the range */
  /* 2. the middle range, with a cliff and a waterfall */
  const wx=X(0.66);
  const mid=prof(x=>Y(0.64)-Y(0.40)*Math.pow(N(0.7*ridged(x*S*3.8,211,6)+0.3*smooth(x*S*2,212,4),0.28,0.78),1.3)*(0.55+0.55*G(0.64,0.18)(x))-Y(0.02)*ridged(x*S*16,213,3));
  gradFill(mid,"#a9d3bf","#8cc0a6");slopeShade(mid,Y(0.24),.16);rim(mid,.4);
  {const y0=at(mid,wx)+Y(0.05),y1=Y(0.72);ctx.fillStyle=shade("#a8d4bd",.88);ctx.beginPath();for(let y=y0-3;y<=y1;y+=3)ctx.lineTo(wx-X(0.008)-rand()*X(0.008),y);for(let y=y1;y>=y0-3;y-=3)ctx.lineTo(wx+X(0.008)+rand()*X(0.008),y);ctx.closePath();ctx.fill();
    const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,"rgba(255,255,255,.95)");g.addColorStop(1,"rgba(255,255,255,.55)");ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(wx-2,y0);ctx.lineTo(wx+2,y0);ctx.lineTo(wx+3.5,y1);ctx.lineTo(wx-3.5,y1);ctx.closePath();ctx.fill();
    ctx.fillStyle="rgba(255,255,255,.55)";for(let k=0;k<7;k++){ctx.beginPath();ctx.arc(wx+(rand()-0.5)*16,y1-2+rand()*4,3+rand()*4,0,7);ctx.fill()}}
  ctx.fillStyle=shade("#a8d4bd",.86);for(let x=4;x<W;x+=10+rand()*22){const y=at(mid,x);if(smooth(x*S*6,214,2)>0.5&&Math.abs(x-wx)>X(0.03))grove(ctx,x,y+Y(0.05)+rand()*Y(0.04),4,2+Math.floor(rand()*3))}
  mistBand(Y(0.63),Y(0.035),.7,215);
  /* 3. forested hills; in the middle they slope gently down to the water's edge */
  const hill=prof(x=>{const b=Y(0.70)-Y(0.17)*smooth(x*S*4,221,5)-Y(0.05)*ridged(x*S*11,222,3)+Y(0.04)*G(0.66,0.04)(x),m=lakeMask(x),k=m*m*(3-2*m);return Math.min(lakeY,b)*(1-k)+lakeY*k});
  gradFill(hill,"#8cc6a0","#72ad8a");slopeShade(hill,Y(0.12),.10);woods(hill,"rgba(112,166,134,.24)",226,7,0.58,Y(0.07));rim(hill,.25);
  ctx.fillStyle=shade("#8fc4a6",.84);
  for(let x=2;x<W;x+=7+rand()*12){if(lakeMask(x)>0.6)continue;const y=at(hill,x);if(y>H-3)continue;const d=smooth(x*S*5,223,3);if(d<0.38||rand()>0.75)continue;
    if(rand()<0.65)pine(ctx,x,y+2+rand()*Y(0.03),6+rand()*9,(rand()-0.5)*0.4);else roundTree(ctx,x,y+2+rand()*Y(0.02),7+rand()*5)}
  mistBand(lakeY-Y(0.01),Y(0.025),.5,224);
  /* 4. the lake in the valley: sky-coloured water with the range reflected faintly, and a light shimmer */
  const cxL=(lakeL+lakeR)/2,rx=(lakeR-lakeL)/2*0.92,ry=Y(0.10),basin=()=>{ctx.beginPath();ctx.ellipse(cxL,lakeY,rx,ry,0,0,Math.PI);ctx.closePath()},
    inLake=(x,y)=>y>=lakeY-1&&Math.pow((x-cxL)/rx,2)+Math.pow((y-lakeY)/ry,2)<1;
  {
    const g=ctx.createLinearGradient(0,lakeY,0,lakeY+ry);g.addColorStop(0,"#c6e7ef");g.addColorStop(1,"#94cadd");ctx.fillStyle=g;basin();ctx.fill();
    ctx.save();basin();ctx.clip();ctx.globalAlpha=.22;ctx.translate(0,2*lakeY);ctx.scale(1,-1);ctx.fillStyle="#6fa58d";shape(hill);ctx.fill();ctx.globalAlpha=.10;ctx.fillStyle="#ffffff";shape(far);ctx.fill();ctx.restore();
    ctx.strokeStyle="rgba(255,255,255,.8)";ctx.lineWidth=1;for(let k=0;k<30;k++){const t=rand(),x=cxL+(rand()-0.5)*rx*1.6*(1-t*0.5),y=lakeY+3+t*ry*0.8,l=4+rand()*16*(1-t*0.4);ctx.globalAlpha=.35+rand()*.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+l,y);ctx.stroke()}ctx.globalAlpha=1;
    ctx.strokeStyle="rgba(90,140,110,.35)";ctx.lineWidth=1.2;basin();ctx.stroke()}
  /* 5. meadow foreground: a low bank on the left, a broad slope on the right, groves and boulders */
  const fore=prof(x=>Math.min(H+3-Y(0.13)*Math.exp(-Math.pow(x/X(0.14),2)),H+3-Y(0.30)*Math.pow(Math.max(0,(x-X(0.60))/X(0.40)),1.3),H-Y(0.05)-Y(0.03)*smooth(x*S*6,233,3))-Y(0.02)*smooth(x*S*7,231,3));
  gradFill(fore,"#7fbf8c","#5f9e72");
  {const cols=["rgba(255,255,255,.55)","rgba(250,232,170,.55)","rgba(242,196,206,.5)"];for(let k=0;k<160;k++){const x=rand()*W,y0=at(fore,x);if(y0>H-6)continue;const y=y0+4+rand()*(H-y0-4);
    ctx.fillStyle=cols[k%3];ctx.beginPath();ctx.arc(x,y,0.7+rand()*0.9,0,7);ctx.fill()}}
  ctx.fillStyle=shade("#78b28f",.80);
  for(let x=X(0.64);x<W;x+=12+rand()*22){const y=at(fore,x);if(y>H-4)continue;if(smooth(x*S*8,232,2)>0.36)grove(ctx,x,y+3,11,2+Math.floor(rand()*4))}
  for(let x=2;x<X(0.12);x+=14+rand()*20)grove(ctx,x,at(fore,x)+3,9,1+Math.floor(rand()*3));

  /* 6. a stream winding down the valley toward the viewer: thin and faint in the distance, wider and brighter up close */
  {const x0=X(0.34),x1=X(0.47),y0=lakeY-1,pts=[];
    /* it leaves the lake at the near shore: nothing of it is drawn over the water */
    ctx.save();ctx.beginPath();ctx.rect(-W,-H,3*W,3*H);ctx.ellipse(cxL,lakeY,rx+1,ry+1,0,0,Math.PI);ctx.closePath();ctx.clip("evenodd");
    for(let i=0;i<=120;i++){const t=i/120,y=y0+(H+6-y0)*Math.pow(t,1.25),amp=X(0.015)+X(0.10)*Math.pow(t,1.4);
      const x=x0+(x1-x0)*t+amp*Math.sin(t*Math.PI*2.6+0.7)+X(0.01)*(smooth(t*6,261,3)-0.5);pts.push([x,y,0.8+Math.pow(t,1.6)*(W<900?15:26)])}
    const band=(k,col)=>{ctx.fillStyle=col;ctx.beginPath();pts.forEach(([x,y,w],i)=>i?ctx.lineTo(x-w*k,y):ctx.moveTo(x-w*k,y));pts.slice().reverse().forEach(([x,y,w])=>ctx.lineTo(x+w*k,y));ctx.closePath();ctx.fill()};
    band(1.45,"rgba(96,150,118,.55)");                                        /* darker, damp banks */
    const g=ctx.createLinearGradient(0,y0,0,H);g.addColorStop(0,"#cfeeea");g.addColorStop(1,"#bfe7e3");band(1,g);
    ctx.strokeStyle="rgba(255,255,255,.7)";ctx.lineWidth=1;ctx.lineCap="round";
    for(let i=14;i<118;i+=4){const[x,y,w]=pts[i];if(w<2)continue;const o=(rand()-0.5)*w*0.8;ctx.beginPath();ctx.moveTo(x+o-w*0.25,y);ctx.lineTo(x+o+w*0.2,y);ctx.stroke()}
    /* trees and reeds along the banks */
    ctx.restore();
    ctx.fillStyle="#6aa47f";for(let i=10;i<112;i+=5){if(rand()<0.45)continue;const[x,y,w]=pts[i],side=rand()<0.5?-1:1,h=4+i*0.12,tx=x+side*(w*1.5+4+rand()*6);
      if(inLake(x,y)||inLake(tx,y+1))continue;if(rand()<0.3)poplar(ctx,tx,y+1,h*1.4);else roundTree(ctx,tx,y+1,h)}}   /* the stream emerges from the valley mist */
}
/* ---------- day sky: soft stretched clouds in two loose bands, and a low warm glow behind the ranges ---------- */
function drawDaySky(cv){
  const dpr=Math.min(2,window.devicePixelRatio||1),W=innerWidth,H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;
  const ctx=cv.getContext("2d");ctx.clearRect(0,0,cv.width,cv.height);
  const landTop=H-Math.min(H*0.28,250);

  const sc=0.35,w=Math.ceil(W*sc),h=Math.ceil(H*sc),off=document.createElement("canvas");off.width=w;off.height=h;
  const oc=off.getContext("2d"),img=oc.createImageData(w,h),D=img.data,k=1/Math.max(W,900);
  /* high, thin streaks of cirrus, and a hazy layer of stratus lying low over the ranges */
  const bands=[[0.09,0.05,0.8],[0.20,0.04,0.5]],ls=(landTop/H)-0.035;
  for(let j=0;j<h;j++){const y=j/sc;let m=0;for(const[c,s,a] of bands)m=Math.max(m,a*Math.exp(-Math.pow((y/H-c)/s,2)));
    const st=0.75*Math.exp(-Math.pow((y/H-ls)/0.035,2));if(m<0.02&&st<0.02)continue;
    for(let i=0;i<w;i++){const x=i/sc,p=(j*w+i)*4;let A=0,cr=255,cg=255,cb=255;
      if(m>=0.02){const n=fbm(x*k*2.2+3,y*k*7.5,5),v=Math.max(0,(n-0.44)/0.26)*m;A=v*v*190}
      if(st>=0.02){const n=fbm(x*k*1.6+40,y*k*16,5),v=Math.max(0,(n-0.38)/0.30)*st,B=v*150;if(B>A){A=B;cr=236;cg=244;cb=248}}
      if(A<=0)continue;D[p]=cr;D[p+1]=cg;D[p+2]=cb;D[p+3]=Math.min(255,A)}}
  oc.putImageData(img,0,0);ctx.imageSmoothingQuality="high";ctx.drawImage(off,0,0,cv.width,cv.height)}
/* ---------- day clouds: fair-weather cumulus, each modelled as a heap of spheres (big billows carrying smaller ones),
   its outline broken up with noise, then lit from the upper left: bright crowns, grey-blue shaded flanks and a flat, darker base.
   Each cloud is painted once into its own bitmap; the layer then just drifts. ---------- */
function blurBox(a,w,h,r){if(r<1)return a.slice();r=Math.round(r);const t=new Float32Array(a.length),o=new Float32Array(a.length),n=2*r+1;
  for(let y=0;y<h;y++){let s=0;const row=y*w;for(let x=-r;x<=r;x++)s+=a[row+Math.min(w-1,Math.max(0,x))];
    for(let x=0;x<w;x++){t[row+x]=s/n;s+=a[row+Math.min(w-1,x+r+1)]-a[row+Math.max(0,x-r)]}}
  for(let x=0;x<w;x++){let s=0;for(let y=-r;y<=r;y++)s+=t[Math.min(h-1,Math.max(0,y))*w+x];
    for(let y=0;y<h;y++){o[y*w+x]=s/n;s+=t[Math.min(h-1,y+r+1)*w+x]-t[Math.max(0,y-r)*w+x]}}
  return o}
function cumulus(w,o){
  /* w: width in CSS px; o.tall: how high it towers; o.res: pixels per CSS px; o.haze: 0..1 fade toward the sky colour (distance) */
  const s=o.res,U=w*s,cx=0,yb=0;let CW,CH,CX,YB;   /* built around (0,0) = the middle of the base, then fitted into a bitmap */
  const P=[];
  /* the main billows, sitting on a common flat base and rising to a dome */
  const n0=4+Math.floor(rand()*3);
  const peak=0.35+0.3*rand();   /* the tallest part sits off-centre */
  for(let i=0;i<n0;i++){const t=(i+0.5)/n0,dome=Math.pow(Math.sin(Math.PI*Math.pow(t,Math.log(0.5)/Math.log(peak))),1.1),r=U*(0.07+0.15*dome)*(0.75+0.45*rand())*(0.8+0.25*o.tall);
    P.push([cx+(t-0.5)*U*0.80+(rand()-0.5)*U*0.05,yb-r*(0.25+0.55*dome*o.tall)-(1-dome)*r*0.75,U*0.02*rand(),r,0])}
  const nt=o.tall>0.6?1+Math.floor(rand()*2):0;
  for(let i=0;i<nt;i++){const r=U*(0.11+0.05*rand());P.push([cx+(rand()-0.5)*U*0.28,yb-U*(0.22+0.10*rand())*o.tall-r*0.4,U*0.05,r,0])}
  /* smaller billows growing out of the bigger ones, mostly upward and toward the viewer */
  for(let lev=1;lev<=3;lev++){const parents=P.filter(p=>p[4]===lev-1);
    for(const p of parents){const m=(lev===1?3:lev===2?2:1)+Math.floor(rand()*(lev===3?2:3));
      for(let k=0;k<m;k++){const a=-Math.PI/2+(rand()-0.5)*Math.PI*1.15,ph=rand()*0.85,dx=Math.cos(a)*Math.cos(ph),dy=Math.sin(a)*Math.cos(ph),dz=Math.sin(ph);
        const r=p[3]*(lev===1?0.36+0.24*rand():lev===2?0.32+0.2*rand():0.34+0.2*rand()),d=p[3]*(0.80+0.12*rand());
        const y=p[1]+dy*d;if(y-r*0.2>yb||(y+r>yb&&Math.abs(p[0]+dx*d)>U*0.3))continue;P.push([p[0]+dx*d,y,p[2]+dz*d*0.6,r,lev])}}}
  {let x0=1e9,x1=-1e9,y0=1e9;for(const[x,y,,r] of P){x0=Math.min(x0,x-r);x1=Math.max(x1,x+r);y0=Math.min(y0,y-r)}
    const m=U*0.09,ox=m-x0,oy=m-y0;for(const p of P){p[0]+=ox;p[1]+=oy}CW=Math.ceil(x1-x0+2*m);CH=Math.ceil(-y0+2*m);CX=ox;YB=oy}
  const cw=CW,ch=CH;
  /* splat the spheres: Z is the visible surface height, T the thickness of cloud along the line of sight */
  const N=cw*ch,Z=new Float32Array(N),T=new Float32Array(N);let top=YB;
  for(const[x,y,z,r] of P){top=Math.min(top,y-r);const x0=Math.max(0,Math.floor(x-r)),x1=Math.min(cw-1,Math.ceil(x+r)),y0=Math.max(0,Math.floor(y-r)),y1=Math.min(ch-1,Math.ceil(y+r)),r2=r*r;
    for(let j=y0;j<=y1;j++){const dy=j-y;for(let i=x0;i<=x1;i++){const dx=i-x,d2=dx*dx+dy*dy;if(d2>=r2)continue;const h=Math.sqrt(r2-d2),q=j*cw+i,zz=z+h;if(zz>Z[q])Z[q]=zz;T[q]+=h*2}}}
  const Zs=blurBox(Z,cw,ch,U*0.006),Zb=blurBox(Z,cw,ch,U*0.05),Zm=blurBox(Zb,cw,ch,U*0.05),Ts=blurBox(T,cw,ch,U*0.012);
  const samp=(A,x,y)=>{x=Math.max(0,Math.min(cw-1.001,x));y=Math.max(0,Math.min(ch-1.001,y));const i=x|0,j=y|0,fx=x-i,fy=y-j,q=j*cw+i;
    return(A[q]*(1-fx)+A[q+1]*fx)*(1-fy)+(A[q+cw]*(1-fx)+A[q+cw+1]*fx)*fy};
  /* pass 1: warp the outline with noise (less near the flat base) and roughen the surface into small cauliflower bumps */
  const H=new Float32Array(N),HM=new Float32Array(N),TT=new Float32Array(N),AO=new Float32Array(N),sd=o.seed||0,f=1/U;
  for(let j=0;j<ch;j++){const nearBase=Math.min(1,Math.max(0,(YB-j)/(U*0.10)));
    for(let i=0;i<cw;i++){const nx=i*f,ny=j*f,q=j*cw+i;
      const wx=(fbm(nx*11+sd,ny*11,3)-0.5)*U*0.05,wy=(fbm(nx*11+sd+31,ny*11+17,3)-0.5)*U*0.045*nearBase;
      const t=samp(Ts,i+wx,j+wy);TT[q]=t;if(t<=0.01){H[q]=0;AO[q]=0;continue}
      const m=Math.min(1,t/(U*0.05));
      H[q]=samp(Zs,i+wx,j+wy)+(fbm(nx*18+sd,ny*18,3)-0.5)*U*0.014*m;
      AO[q]=samp(Zb,i+wx,j+wy);HM[q]=samp(Zm,i+wx,j+wy)}}
  /* pass 2: light it. Sun up and to the left, a little in front of the cloud */
  let Lx=-0.55,Ly=-0.62,Lz=0.56;const Ll=Math.hypot(Lx,Ly,Lz);Lx/=Ll;Ly/=Ll;Lz/=Ll;const Lh=Math.hypot(Lx,Ly),sx=Lx/Lh,sy=Ly/Lh,slope=Lz/Lh,step=U*0.018;
  const img=new ImageData(cw,ch),D=img.data,sky=o.sky||[196,232,240],hz=o.haze||0;
  const sun=[255,254,250],shd=[166,184,204],bas=[142,158,182];
  for(let j=1;j<ch-1;j++){const v=Math.min(1,Math.max(0,(j-top)/(YB-top)));
    for(let i=1;i<cw-1;i++){const q=j*cw+i,t=TT[q];if(t<=0.01)continue;const baseCut=Math.min(1,Math.max(0,(YB+U*0.006+(fbm(i*f*5+sd,3,2)-0.5)*U*0.035-j)/(U*0.016)));
      /* opacity: thick in the middle, thin and broken at the edges */
      let a=1-Math.exp(-t/(U*0.07));const e=0.6*fbm(i*f*12+sd+7,j*f*12,3)+0.4*fbm(i*f*40+sd,j*f*40,2);a=Math.min(1,Math.max(0,(a*(0.55+0.9*e)-0.10)/0.75));a=a*a*(3-2*a)*baseCut;if(a<=0.003)continue;
      const h=H[q],gx=(H[q+1]-H[q-1])*0.5,gy=(H[q+cw]-H[q-cw])*0.5,nl=Math.hypot(gx,gy,1),ndl=(-gx*Lx-gy*Ly+Lz)/nl;
      /* the big form (heavily smoothed): lit on the sun side, in shade away from it */
      const mx=(HM[q+1]-HM[q-1])*0.5*3,my=(HM[q+cw]-HM[q-cw])*0.5*3,ml=Math.hypot(mx,my,1),mdl=(-mx*Lx-my*Ly+Lz)/ml;
      /* self-shadow: march toward the sun over the height field (billows shading their neighbours) */
      let occ=0;for(let k=1;k<=9;k++){const d=k*step,hh=samp(H,i+sx*d,j+sy*d)-(h+slope*d);if(hh>occ)occ=hh}
      const shadow=1-0.6*Math.min(1,occ/(U*0.03));
      const ao=Math.min(1,Math.max(0,1-(AO[q]-h)/(U*0.045)));
      const fine=Math.min(1,Math.max(0,(ndl+0.2)/1.1)),big=Math.min(1,Math.max(0,(mdl+0.15)/0.95));
      let lit=(0.5*fine+0.5*big)*shadow*(0.55+0.45*ao);
      lit=lit*(1-0.5*Math.pow(v,1.6))+(1-a)*0.3;                 /* darker toward the base; thin edges let the light through */
      lit=Math.min(1,Math.max(0,lit));lit=lit*lit*(3-2*lit)*0.6+lit*0.4;
      const bk=Math.max(0,v-0.6)/0.4*(1-lit*0.6);
      for(let c=0;c<3;c++){let col=shd[c]+(sun[c]-shd[c])*lit;col+=(bas[c]-col)*bk*0.75;col+=(sky[c]-col)*hz;D[q*4+c]=col}
      D[q*4+3]=a*255}}
  const cv=document.createElement("canvas");cv.width=cw;cv.height=ch;cv.getContext("2d").putImageData(img,0,0);
  return{cv,w:cw/s,h:ch/s,ax:CX/s,ay:YB/s}}
function drawDayClouds(cv){
  const dpr=Math.min(2,window.devicePixelRatio||1),W=innerWidth,H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;
  const ctx=cv.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  const base=Math.min(W,1600)*0.16*(W<700?1.5:1),res=Math.min(1.25,dpr)*0.8;
  /* [x, y of the base, size, how tall, haze]: big towering clouds high up, flatter and hazier ones toward the horizon */
  const C=[[0.10,0.20,1.15,0.9,0],[0.38,0.11,0.75,0.7,0.02],[0.70,0.23,1.35,1.0,0],[0.93,0.13,0.70,0.65,0.03],
           [0.24,0.40,0.55,0.55,0.12],[0.55,0.44,0.45,0.45,0.16],[0.83,0.41,0.52,0.5,0.14],[0.05,0.52,0.36,0.35,0.24],[0.42,0.57,0.30,0.3,0.3],[0.97,0.56,0.32,0.3,0.3],[0.68,0.60,0.26,0.25,0.34],
           [0.15,0.645,0.30,0.2,0.45],[0.47,0.665,0.26,0.16,0.5],[0.74,0.635,0.24,0.2,0.45],[0.95,0.675,0.22,0.15,0.55]];
  const landTop=1-Math.min(0.28,250/H);
  C.forEach(([fx,fy,sc,tall,haze],k)=>{if(fy>landTop-0.03)return;rnd=1013+k*7919;const w=base*sc;
    const b=cumulus(w,{tall,res,haze,seed:k*13.7}),sx=1+haze*1.2;   /* distant ones are seen edge-on: flatter */
    ctx.globalAlpha=0.95-0.4*haze;ctx.filter=haze>0.2?`blur(${(haze*1.6).toFixed(2)}px)`:"none";ctx.drawImage(b.cv,fx*W-b.ax*sx,fy*H-b.ay,b.w*sx,b.h)});
  ctx.globalAlpha=1;ctx.filter="none"}

/* ---------- a few small flocks crossing the day sky, wings beating ---------- */
function birdsSVG(){const up="M0 0 C-3 -2 -6 -3 -9 -2 C-6 -2.4 -3 -1 0 1 C3 -1 6 -2.4 9 -2 C6 -3 3 -2 0 0Z",dn="M0 0 C-3 1 -6 3 -8 5 C-5 2 -3 1 0 1.2 C3 1 5 2 8 5 C6 3 3 1 0 0Z";
  const flock=(n,seed)=>{let s=seed;const r=()=>(s=(s*9301+49297)%233280)/233280;let h="";for(let i=0;i<n;i++){const row=Math.ceil(i/2),side=i%2?1:-1,x=i?-row*14+r()*4:0,y=i?side*row*8+r()*3:0,d=(0.55+r()*0.25).toFixed(2),k=(0.8+r()*0.35).toFixed(2);
    h+='<g transform="translate('+x+' '+y+') scale('+k+')"><path fill="#2f4858" d="'+up+'"><animate attributeName="d" dur="'+d+'s" begin="-'+r().toFixed(2)+'s" repeatCount="indefinite" values="'+up+';'+dn+';'+up+'"/></path></g>'}return h};
  return[[5,7,"gfBirdA",14,95],[3,13,"gfBirdB",27,140],[7,21,"gfBirdC",9,120]].map(([n,seed,id,top,dur])=>'<svg class="gf-birds '+id+'" style="top:'+top+'vh;animation-duration:'+dur+'s" viewBox="-110 -40 140 80" width="110" height="64">'+flock(n,seed)+'</svg>').join("")}
const NIGHT={c:["#20265e","#1a1f55","#14194a","#0e123c","#080b26"],w:["#2a2d6e","#1a1e52","#10143c"],ripple:"rgba(200,190,255,.12)",
  snow:"rgba(120,125,200,.55)",snow0:"rgba(120,125,200,0)",rim:a=>`rgba(190,180,255,${a})`,mist0:"rgba(150,140,235,0)",mist:"rgba(150,140,235,.06)"};
const drawn={};
function ensure(f,id,tag){let e=document.getElementById(id);if(!e){e=document.createElement(tag);e.id=id;e.setAttribute("aria-hidden","true");f.appendChild(e)}return e}
function sync(){
  const B=document.body;if(!B||!B.classList.contains("sky-theme"))return;
  const f=document.getElementById("skyField");if(!f)return;
  const night=B.classList.contains("sky-night"),mode=night?"night":"day",key=mode+innerWidth+"x"+innerHeight;
  const sky=ensure(f,night?"gfNightGalaxy":"gfDaySky","canvas"),land=ensure(f,night?"gfNightLand":"gfDayLand","div");
  const clouds=night?null:ensure(f,"gfDayClouds","canvas");
  if(!night&&!document.getElementById("gfBirds")){const b=document.createElement("div");b.id="gfBirds";b.setAttribute("aria-hidden","true");b.innerHTML=birdsSVG();f.appendChild(b)}
  if(drawn[mode]===key)return;drawn[mode]=key;
  try{if(night){drawGalaxy(sky);drawLand(land,NIGHT)}else{drawDaySky(sky);drawDayClouds(clouds);drawDayLand(land)}}catch(e){console.warn("sky background",e)}
}
window.gfSkySync=sync;
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:["class"],childList:true});
let t;addEventListener("resize",()=>{clearTimeout(t);t=setTimeout(sync,250)});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync);else sync();
})();
