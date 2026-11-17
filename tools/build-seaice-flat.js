const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:800,height:600}});
p.on('console',m=>console.log('C',m.text().slice(0,200)));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(3000);
const out=await p.evaluate(async()=>{
 const ld=s=>new Promise((res,rej)=>{const i=new Image;i.onload=()=>res(i);i.onerror=rej;i.src=s});
 const data=im=>{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);return x.getImageData(0,0,c.width,c.height)};
 const ice=data(await ld('textures/SEAICE_POLAR.png?v=1')),sat=data(await ld('textures/SAT_FLAT_IMG.webp?v=2'));
 const IW=ice.width,IH=ice.height,ID=ice.data,SW=sat.width,SH=sat.height,SD=sat.data;
 const SX0=0,SY0=-6.688,SKX=SW/2000,SKY=SH/1014.376;
 const fr=x=>x-Math.floor(x);
 const ih=(x,y,z)=>{x=fr(x*.3183099+.1)*17;y=fr(y*.3183099+.1)*17;z=fr(z*.3183099+.1)*17;return fr(x*y*z*(x+y+z))};
 const L=(a,b,t)=>a+(b-a)*t;
 const no=(x,y,z)=>{const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);let fx=x-ix,fy=y-iy,fz=z-iz;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);fz=fz*fz*(3-2*fz);
  return L(L(L(ih(ix,iy,iz),ih(ix+1,iy,iz),fx),L(ih(ix,iy+1,iz),ih(ix+1,iy+1,iz),fx),fy),L(L(ih(ix,iy,iz+1),ih(ix+1,iy,iz+1),fx),L(ih(ix,iy+1,iz+1),ih(ix+1,iy+1,iz+1),fx),fy),fz)};
 const fbm=(x,y,z)=>.5*no(x,y,z)+.27*no(x*2.07,y*2.07,z*2.07)+.15*no(x*4.31,y*4.31,z*4.31)+.08*no(x*8.9,y*8.9,z*8.9);
 const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
 const iceAt=(qx,qy,south)=>{/* bilinear in one square */const fx=((qx+(south?1:0))*.5)*IW-.5,fy=qy*IH-.5;const x0=Math.floor(fx),y0=Math.floor(fy),tx=fx-x0,ty=fy-y0;
  const lo=south?IW/2:0,hi=south?IW-1:IW/2-1;const cx=v=>Math.min(hi,Math.max(lo,v)),cy=v=>Math.min(IH-1,Math.max(0,v));
  const g=(x,y,c)=>ID[(cy(y)*IW+cx(x))*4+c];const v=c=>L(L(g(x0,y0,c),g(x0+1,y0,c),tx),L(g(x0,y0+1,c),g(x0+1,y0+1,c),tx),ty)/255;return[v(0),v(1)]};
 const satAt=(mx,my)=>{const x=Math.min(SW-1,Math.max(0,Math.round((mx-SX0)*SKX-.5))),y=Math.min(SH-1,Math.max(0,Math.round((my-SY0)*SKY-.5)));const i=(y*SW+x)*4;return[SD[i]/255,SD[i+1]/255,SD[i+2]/255,SD[i+3]/255]};
 const ROB=d3.geoRobinson().scale(318.31).translate([1e3,500.5]);const K=2;const res=[];
 for(const [la0,la1,south] of [[90,50,false],[-50,-90,true]]){
  const y0=Math.floor(ROB([0,la0])[1]),y1=Math.ceil(ROB([0,la1])[1]),W=2000*K,H=(y1-y0)*K;
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');const id=x.createImageData(W,H),D=id.data;
  for(let py=0;py<H;py++){const my=y0+(py+.5)/K;const ll0=ROB.invert([1e3,my]);if(!ll0)continue;const lat=ll0[1];if(Math.abs(lat)<50)continue;
   const e=ROB([180,lat]);const hw=e[0]-1e3;if(!(hw>0))continue;
   for(let px=0;px<W;px++){const mx=(px+.5)/K;const lonD=(mx-1e3)/hw*180;if(Math.abs(lonD)>180)continue;
    const lon=lonD*Math.PI/180,r=(90-Math.abs(lat))/40;
    const qx=.5+.5*r*Math.sin(lon),qy=south?.5-.5*r*Math.cos(lon):.5+.5*r*Math.cos(lon);
    const [cc,shelf]=iceAt(qx,qy,south);if(cc<.12&&shelf<.25)continue;
    const la=lat*Math.PI/180,X=Math.cos(la)*Math.cos(lon),Y=Math.cos(la)*Math.sin(lon),Z=Math.sin(la);
    const n=fbm(X*90,Y*90,Z*90),fine=fbm(X*420,Y*420,Z*420);
    const edge=ss(.13,.17,cc),open=Math.min(1,Math.max(0,1-cc)),floe=ss(open*1.15-.04,open*1.15+.04,L(n,fine,.35));
    const s=satAt(mx,my);if(s[3]<.5)continue;const lum=s[0]*.3+s[1]*.55+s[2]*.15;
    const water=ss(.015,.07,s[2]-Math.max(s[0],s[1]*.82))*(1-ss(.28,.5,lum));
    const shelfC=ss(.3,.7,shelf);const a=Math.max(edge*floe*ss(0,.25,water+.15),shelfC);if(a<.004)continue;
    const t=ss(.55,.95,cc),k=.92+.12*fine;const ir=L(.80,.93,t)*k,ig=L(.86,.95,t)*k,ib=L(.91,.97,t)*k;
    const i=(py*W+px)*4;D[i]=Math.min(255,ir*255);D[i+1]=Math.min(255,ig*255);D[i+2]=Math.min(255,ib*255);D[i+3]=a*255}}
  x.putImageData(id,0,0);res.push({y:y0,h:y1-y0,url:c.toDataURL('image/png')})}
 return res});
out.forEach((o,i)=>{fs.writeFileSync('band'+i+'.png',Buffer.from(o.url.split(',')[1],'base64'));console.log(i,o.y,o.h)});
await b.close()})();
