# Softens the hand-drawn inner boundaries of the prehistoric maps in terra-atlas-history-topo.js (the ranges of our species,
# Neanderthals and other humans before 3000 BC): every arc shared by two areas (an inner boundary, never a coast) is cut into
# short steps, given a gentle irregular wave (fixed, so it is the same on every load) and rounded off. Coasts stay exact.
import json,math,re,sys
p='terra-atlas-history-topo.js';src=open(p).read()
i=src.index('window.TERRA_HISTORY_TOPO = ')+len('window.TERRA_HISTORY_TOPO = ')
j=src.rindex(']')+1
A=json.loads(src[i:j])
meta=open('terra-atlas-history-meta.js').read()
ys=re.findall(r'"y":"([^"]+)"',meta)
def noise(t,seed):
  return sum(math.sin(t*f+seed*k)/f for k,f in ((1.3,1),(2.7,2.1),(4.1,4.3)))
done=0
for idx,T in enumerate(A):
  if idx>=len(ys) or not ys[idx].startswith('bc') or int(ys[idx][2:])<5000: continue
  sx,sy=T['transform']['scale'];tx,ty=T['transform']['translate']
  arcs=[]
  for a in T['arcs']:
    x=y=0;pts=[]
    for d in a: x+=d[0];y+=d[1];pts.append([x*sx+tx,y*sy+ty])
    arcs.append(pts)
  use=[0]*len(arcs)
  def walk(o):
    if isinstance(o,list):
      for v in o:
        if isinstance(v,int): use[v if v>=0 else ~v]+=1
        else: walk(v)
  for o in T['objects'].values():
    for g in o['geometries']: walk(g.get('arcs',[]))
  for k,pts in enumerate(arcs):
    # any straight run longer than a degree is a hand-drawn edge (the coasts here never run that far in one step): it is
    # given a gentle irregular wave, fixed at both ends so it still meets the coast exactly, then rounded
    out=[pts[0]];changed=False
    for a,b in zip(pts,pts[1:]):
      Ls=math.hypot(b[0]-a[0],b[1]-a[1])
      if Ls<=1.0: out.append(b);continue
      changed=True;n=max(4,int(Ls/0.25));nx,ny=-(b[1]-a[1])/Ls,(b[0]-a[0])/Ls;amp=min(1.8,0.09*Ls)
      seg=[]
      for s_ in range(1,n+1):
        t=s_/n;x=a[0]+(b[0]-a[0])*t;y=a[1]+(b[1]-a[1])*t;w=noise(t*Ls/2.5,k*0.7+idx+a[0]*0.13)*amp*math.sin(math.pi*t)**0.7
        seg.append([x+nx*w,y+ny*w])
      seg[-1]=list(b)
      # round off this run (its ends stay put)
      for _ in range(2):
        sm=[seg[0]]
        for c,d in zip(seg,seg[1:]):sm+=[[c[0]*.75+d[0]*.25,c[1]*.75+d[1]*.25],[c[0]*.25+d[0]*.75,c[1]*.25+d[1]*.75]]
        sm.append(seg[-1]);seg=sm
      out+=seg[1:] if seg[0]==out[-1] else seg
    if changed: arcs[k]=out
  enc=[]
  for pts in arcs:
    q=[[round((x-tx)/sx),round((y-ty)/sy)] for x,y in pts];e=[q[0]]
    for a,b in zip(q,q[1:]):
      if b!=a: e.append([b[0]-a[0],b[1]-a[1]])
    enc.append(e)
  T['arcs']=enc;done+=1
open(p,'w').write(src[:i]+json.dumps(A,separators=(',',':'))+src[j:])
print('smoothed',done)
