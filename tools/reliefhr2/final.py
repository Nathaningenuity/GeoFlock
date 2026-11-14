# upsample corrections, apply, write RGBA HR; then evaluate on the globe grid
import numpy as np,sys
from PIL import Image;Image.MAX_IMAGE_PIXELS=None
d=sys.argv[1]
G=np.load(d+'/G.npy',mmap_mode='r');SEA=np.load(d+'/SEA.npy',mmap_mode='r');H,W=SEA.shape
cL=np.load(d+'/cL.npy');cS=np.load(d+'/cS.npy');al=np.load(d+'/al.npy')
cur=Image.open(d+'/cur.png')
def up(a,y0,y1):
  # upsample a lo-grid float field to HR rows y0:y1 (bilinear, pixel centres)
  h,w=a.shape[:2];ys=(np.arange(y0,y1)+.5)*h/H-.5;xs=(np.arange(W)+.5)*w/W-.5
  yi=np.clip(np.floor(ys).astype(int),0,h-2);ty=np.clip(ys-yi,0,1);xi=np.clip(np.floor(xs).astype(int),0,w-2);tx=np.clip(xs-xi,0,1)
  if a.ndim==2:a=a[...,None]
  A=a[yi];B=a[yi+1];r=A*(1-ty)[:,None,None]+B*ty[:,None,None]
  return r[:,xi]*(1-tx)[None,:,None]+r[:,xi+1]*tx[None,:,None]
OUT=np.lib.format.open_memmap(d+'/OUT.npy',mode='w+',dtype=np.uint8,shape=(H,W,4))
curf=np.asarray(cur).astype(np.float32)
for y in range(0,H,360):
  y1=min(H,y+360);g=G[y:y1].astype(np.float32);sea=SEA[y:y1][...,None]
  c=np.where(sea,up(cS,y,y1),up(cL,y,y1))
  OUT[y:y1,...,:3]=np.clip(np.round(g+c),0,255);OUT[y:y1,...,3]=np.clip(np.round(up(al,y,y1)[...,0]*255),0,255)
OUT.flush()
