# boost mid-scale (2-8 px) land shading; land-only normalized blurs so coasts get no halo. OUT.npy -> OUT2.npy
import numpy as np,sys
from scipy import ndimage
d=sys.argv[1];K=float(sys.argv[2])
O=np.load(d+'/OUT.npy',mmap_mode='r');SEA=np.load(d+'/SEA.npy',mmap_mode='r');H,W=SEA.shape;M=40
O2=np.lib.format.open_memmap(d+'/OUT2.npy',mode='w+',dtype=np.uint8,shape=O.shape)
def nb(a,m,s):
  b=ndimage.gaussian_filter(m,s,mode=('nearest','wrap'));return np.stack([ndimage.gaussian_filter(a[...,c]*m,s,mode=('nearest','wrap')) for c in range(3)],-1)/np.maximum(b,1e-6)[...,None]
for y in range(0,H,360):
  y0=max(0,y-M);y1=min(H,y+360+M)
  a=np.asarray(O[y0:y1,...,:3]).astype(np.float32);land=(~np.asarray(SEA[y0:y1])).astype(np.float32)
  mid=nb(a,land,2)-nb(a,land,8)
  r=a+K*mid*land[...,None]
  s=y-y0;O2[y:y+360,...,:3]=np.clip(np.round(r[s:s+360]),0,255);O2[y:y+360,...,3]=O[y:y+360,...,3]
O2.flush()
