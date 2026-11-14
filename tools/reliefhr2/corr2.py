import numpy as np,sys,os
from PIL import Image;Image.MAX_IMAGE_PIXELS=None
from scipy import ndimage
d=sys.argv[1];SG=float(os.environ.get('SG','1.5'));AMIN=int(os.environ.get('AMIN','1500'));tag=os.environ.get('TAG','')
G=np.load(d+'/G.npy',mmap_mode='r');SEA=np.load(d+'/SEA.npy',mmap_mode='r');h,w=4096,8192
cur=np.asarray(Image.open(d+'/cur.png')).astype(np.float32)
if not os.path.exists(d+'/Glo.npy'):
  np.save(d+'/Glo.npy',np.asarray(Image.fromarray(np.asarray(G)).resize((w,h),Image.BOX)).astype(np.float32))
  np.save(d+'/frac.npy',np.asarray(Image.fromarray((~np.asarray(SEA)).astype(np.float32)).resize((w,h),Image.BOX)))
Glo=np.load(d+'/Glo.npy');frac=np.load(d+'/frac.npy')
R=cur-Glo
curLand=~((cur[...,2]-cur[...,0])>70)
# where the current picture's land/sea disagrees with HR over a large area: its own edits (ice shelves etc.) -> keep the current picture
dis=(curLand&(frac<0.3))|((~curLand)&(frac>0.7))
lab,n=ndimage.label(dis);sz=ndimage.sum(dis,lab,np.arange(1,n+1));big=np.zeros(n+1,bool);big[1:]=sz>AMIN
O=big[lab];print('fallback frac',O.mean(),'components',big.sum())
wl=((frac>0.98)&curLand&~O).astype(np.float32);ws=((frac<0.02)&~curLand&~O).astype(np.float32)
def blur(a,sg):
  if sg<=6:return ndimage.gaussian_filter(a,sg,mode='nearest')
  k=8;hh,ww=a.shape;s=a.reshape(hh//k,k,ww//k,k).mean((1,3));s=ndimage.gaussian_filter(s,sg/k,mode='nearest')
  return ndimage.zoom(s,k,order=1)[:hh,:ww]
def corr(wt):
  out=np.zeros((h,w,3),np.float32);done=np.zeros((h,w),bool)
  for sg in (SG,4,12,40,160):
    b=blur(wt,sg);m=(~done)&(b>(0.15 if sg==SG else 1e-5))
    for c in range(3):
      a=blur(R[...,c]*wt,sg);out[...,c][m]=(a/np.maximum(b,1e-9))[m]
    done|=m
  return out
cL=corr(wl);cS=corr(ws)
al=1-ndimage.gaussian_filter(ndimage.binary_dilation(O,iterations=2).astype(np.float32),1.5);al[O]=0
np.save(d+'/cL.npy',cL);np.save(d+'/cS.npy',cS);np.save(d+'/al.npy',al)
Image.fromarray((al*255).astype(np.uint8)).resize((2048,1024)).save(d+f'/alpha{tag}.png')
# eval approx on lo grid
P=Glo+frac[...,None]*cL+(1-frac[...,None])*cS;P=al[...,None]*P+(1-al[...,None])*cur
e=np.abs(P-cur).mean(-1);print('lo-grid approx err',e.mean(),np.percentile(e,95))
