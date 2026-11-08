/* Lake-bed acceptance harness for the cross-section: on the Maps page, paste into the console (or add as a script), then: await gfLakeTest() */
window.gfLakeTest=async function(){const X=gfCrossSection;await X.loadDEM();await X.loadLakes();const R=6371;
 const row=(a,b,n)=>{const P=[];let km=0;for(let i=0;i<n;i++){const t=i/(n-1),ll=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];if(i)km+=d3.geoDistance(P[i-1].ll,ll)*R;const o=X.lakeAt(ll);P.push({ll,km,e:o?o.lv:Math.round(X.elevAt(ll[0],ll[1])),_o:o})}return P};
 const run=P=>{const t0=performance.now();X.lakeify(P);return performance.now()-t0};
 const LK={"Great Slave":[[-114.3,61.7],41],"Great Bear":[[-121,66],72],"Ladoga":[[31.5,60.8],48],"Como":[[9.26,46.0],154],"Tanganyika":[[29.6,-6.5],570],"Malawi":[[34.6,-12],292],
  "Victoria":[[33,-1],40],"Tahoe":[[-120.04,39.09],300],"Geneva":[[6.55,46.44],154],"Baikal":[[108,53.5],745],"Crater":[[-122.1,42.94],350],"Issyk-Kul":[[77.3,42.4],278],"Caspian":[[50.5,42],211],"Michigan":[[-87,43.5],85],"Mead":[[-114.5,36.15],55],"Erie":[[-81.2,42.2],19]};
 const out={},times=[];let bad=0;
 for(const nm in LK){const [pt,real]=LK[nm],o=X.lakeAt(pt);if(!o){out[nm]="not found";continue}const[[w,s],[e,n]]=o.b,rows=40,cols=80;let sw=0,sd=0,mx=-1,at=null;
  for(let r=0;r<rows;r++){const la=s+(n-s)*(r+.5)/rows;const P=row([w,la],[e,la],cols);times.push(run(P));P.forEach(p=>{if(p._o!==o)return;const d=o.lv-p.e;if(!isFinite(d)||isNaN(p.e))bad++;if(d<-.5)bad++;const wt=Math.cos(la*Math.PI/180);sw+=wt;sd+=wt*d;if(d>mx){mx=d;at=p.ll.map(v=>+v.toFixed(2))}})}
  out[nm]={name:o.n,lv:o.lv,mean:Math.round(sd/sw),real,max:Math.round(mx),at}}
 const dep=(a,b,n,lim)=>{const P=row(a,b,n||200);run(P);let m=0,g=0;P.forEach(p=>{if(!p._o)return;m=Math.max(m,p._o.lv-p.e);g=Math.max(g,p._o.lv-X.elevAt(p.ll[0],p.ll[1]))});return{max:Math.round(m),grid:Math.round(g)}};
 out["N Caspian 46N"]=dep([47,46],[54,46]);out["Middle Caspian 43.5N"]=dep([47,43.5],[53,43.5]);out["Michigan 42.18N"]=dep([-87.9,42.18],[-86.2,42.18]);out["Academician Ridge"]=dep([107.80,53.42],[108.62,53.86]);
 /* two crossing lines give the same depth at the crossing */
 {const c=[30.5,60.9],A=row([c[0]-1,c[1]],[c[0]+1,c[1]],201),B=row([c[0],c[1]-.6],[c[0],c[1]+.6],201);run(A);run(B);const o=A[100]._o;out["Ladoga crossing"]=o?{A:Math.round(o.lv-A[100].e),B:Math.round(o.lv-B[100].e)}:"-"}
 {const c=[29.6,-6.5],A=row([c[0]-.5,c[1]],[c[0]+.5,c[1]],201),B=row([c[0],c[1]-1],[c[0],c[1]+1],201);run(A);run(B);const o=A[100]._o;out["Tanganyika crossing"]=o?{A:Math.round(o.lv-A[100].e),B:Math.round(o.lv-B[100].e)}:"-"}
 {const o=X.lakeAt([-111.15,62.6]);out["Great Slave anchor"]=o?{lake:o.n,lv:o.lv}:"anchor not in lake"}
 {const o=X.lakeAt([-114.5,36.15]);if(o)out["Mead pour/dam"]={t:o.t,pour:o.pour,grand:o.grand}}
 out["Great Slave through deep point"]=dep([-111.8,62.6],[-110.5,62.6],400);
 /* redraw cost once each lake's numbers are cached: the same rows again */
 {const t=[];[[[47,46],[54,46]],[[-87.9,42.18],[-86.2,42.18]],[[28.9,-6.5],[30.6,-6.5]],[[-114.4,61.6],[-110.5,62.6]]].forEach(([a,b])=>{const P=row(a,b,300);t.push(run(P))});out._redrawMs=t.map(v=>+v.toFixed(1))}
 times.sort((a,b)=>a-b);out._timing={median:+times[times.length>>1].toFixed(1),max:+times[times.length-1].toFixed(1)};out._bad=bad;return out};
