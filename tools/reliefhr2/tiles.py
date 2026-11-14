import numpy as np,sys,os,json
from PIL import Image;Image.MAX_IMAGE_PIXELS=None
d,out=sys.argv[1:3];T=360;Q=85
O=np.load(d+'/OUT2.npy',mmap_mode='r');H,W=O.shape[:2]
def save(t,p):
  if t[...,3].min()<255:Image.fromarray(t,'RGBA').save(p,'WEBP',quality=Q,method=6,alpha_quality=90)
  else:Image.fromarray(np.ascontiguousarray(t[...,:3])).save(p,'WEBP',quality=Q,method=6)
os.makedirs(out+'/1',exist_ok=True);os.makedirs(out+'/0',exist_ok=True)
for r in range(H//T):
  for c in range(W//T):save(np.asarray(O[r*T:(r+1)*T,c*T:(c+1)*T]),f'{out}/1/{c}_{r}.webp')
# level 0: half resolution (premultiply-safe: alpha is 255 almost everywhere)
for r in range(H//(2*T)):
  strip=Image.fromarray(np.asarray(O[r*2*T:(r+1)*2*T]),'RGBA').resize((W//2,T),Image.LANCZOS);a=np.asarray(strip)
  for c in range(W//(2*T)):save(a[:,c*T:(c+1)*T],f'{out}/0/{c}_{r}.webp')
