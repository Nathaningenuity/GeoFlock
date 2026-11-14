# Build graded HR: LUT(HR) + smooth per-class correction; alpha 0 where the current picture has its own edits.
import numpy as np,sys,os
from PIL import Image;Image.MAX_IMAGE_PIXELS=None
from scipy import ndimage
hr_path,d=sys.argv[1:3]
SG=float(os.environ.get('SG','4'))
N=33;s=(N-1)/255.;lut=np.load(d+'/lut33.npy').reshape(-1,3)
def apply(src):
  sh=src.shape;src=src.reshape(-1,3).astype(np.float32)
  f=src*s;i0=np.minimum(np.floor(f).astype(np.int32),N-2);t=f-i0;out=np.zeros_like(src)
  for dx in (0,1):
    wx=t[:,0] if dx else 1-t[:,0]
    for dy in (0,1):
      wy=t[:,1] if dy else 1-t[:,1]
      for dz in (0,1):
        wz=t[:,2] if dz else 1-t[:,2]
        out+=(wx*wy*wz)[:,None]*lut[((i0[:,0]+dx)*N+(i0[:,1]+dy))*N+(i0[:,2]+dz)]
  return out.reshape(sh)
issea=lambda p:(p[...,2]-p[...,0])>70
HR=np.asarray(Image.open(hr_path).convert('RGB'));H,W=HR.shape[:2];print(W,H)
# pass 1: graded HR + sea mask
G=np.zeros((H,W,3),np.uint8);SEA=np.zeros((H,W),bool)
for y in range(0,H,540):
  p=apply(HR[y:y+540]);G[y:y+540]=np.clip(np.round(p),0,255);SEA[y:y+540]=issea(p)
del HR
np.save(d+'/G.npy',G);np.save(d+'/SEA.npy',SEA)
