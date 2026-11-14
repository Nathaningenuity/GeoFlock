import numpy as np,sys
from PIL import Image;Image.MAX_IMAGE_PIXELS=None
from scipy import ndimage
N=int(sys.argv[2]) if len(sys.argv)>2 else 33
d=sys.argv[1]
cur=np.asarray(Image.open(d+'/cur.png')).reshape(-1,3).astype(np.float32);lo=np.asarray(Image.open(d+'/hr_lo.png')).reshape(-1,3).astype(np.float32)
s=(N-1)/255.
def splat(src,tgt,w=None):
  f=src*s;i0=np.minimum(np.floor(f).astype(np.int32),N-2);t=f-i0
  acc=np.zeros((N**3,3));wt=np.zeros(N**3)
  for dx in (0,1):
    wx=t[:,0] if dx else 1-t[:,0]
    for dy in (0,1):
      wy=t[:,1] if dy else 1-t[:,1]
      for dz in (0,1):
        wz=t[:,2] if dz else 1-t[:,2]
        ww=wx*wy*wz
        idx=((i0[:,0]+dx)*N+(i0[:,1]+dy))*N+(i0[:,2]+dz)
        wt+=np.bincount(idx,ww,N**3)
        for c in range(3):acc[:,c]+=np.bincount(idx,ww*tgt[:,c],N**3)
  return acc,wt
acc,wt=splat(lo,cur)
acc=acc.reshape(N,N,N,3);wt=wt.reshape(N,N,N)
# light smoothing + fill: normalized convolution with growing gaussians
lut=np.zeros_like(acc);have=wt>1e-3
for sg in (0.6,1.5,3,6,12):
  a=np.stack([ndimage.gaussian_filter(acc[...,c],sg,mode='nearest') for c in range(3)],-1);w=ndimage.gaussian_filter(wt,sg,mode='nearest')
  v=a/np.maximum(w,1e-9)[...,None]
  if sg==0.6: lut=v.copy();done=w>0.5
  else:
    m=(~done)&(w>1e-6);lut[m]=v[m];done|=m
print('bins with data',have.mean(),'unfilled',(~done).sum())
np.save(d+f'/lut{N}.npy',lut.astype(np.float32))
def apply(src,lut):
  f=src*s;i0=np.minimum(np.floor(f).astype(np.int32),N-2);t=f-i0;out=np.zeros_like(src)
  L=lut.reshape(-1,3)
  for dx in (0,1):
    wx=t[:,0] if dx else 1-t[:,0]
    for dy in (0,1):
      wy=t[:,1] if dy else 1-t[:,1]
      for dz in (0,1):
        wz=t[:,2] if dz else 1-t[:,2]
        out+=(wx*wy*wz)[:,None]*L[((i0[:,0]+dx)*N+(i0[:,1]+dy))*N+(i0[:,2]+dz)]
  return out
pred=apply(lo,lut)
from skimage.color import rgb2lab,deltaE_ciede2000
P=np.clip(pred,0,255).reshape(4096,8192,3);C=cur.reshape(4096,8192,3)
err=np.abs(P-C).mean(-1)
print('mean abs RGB err',err.mean(),'median',np.median(err),'p95',np.percentile(err,95))
sub=(slice(None,None,4),slice(None,None,4))
de=deltaE_ciede2000(rgb2lab(C[sub]/255),rgb2lab(P[sub]/255))
print('dE2000 mean',de.mean(),'p95',np.percentile(de,95),'p99',np.percentile(de,99))
# mean colour bias
print('mean bias',(P-C).reshape(-1,3).mean(0))
Image.fromarray(np.clip(P,0,255).astype(np.uint8)).save(d+f'/pred{N}.png')
Image.fromarray(np.clip(err*4,0,255).astype(np.uint8)).resize((2048,1024)).save(d+f'/err{N}.png')
