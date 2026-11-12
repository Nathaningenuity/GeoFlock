# Builds textures/nehr: Natural Earth I high-res (NE1_HR_LC_SR_W.tif, naturalearthdata.com, public domain) divided by itself
# blurred to the globe relief picture's resolution (8192 x 4096), in 9-degree tiles. Usage: python3 build-nehr.py NE1_HR_LC_SR_W.tif textures/nehr
import numpy as np,json,sys,os
from PIL import Image;Image.MAX_IMAGE_PIXELS=None
src=sys.argv[1];out=sys.argv[2];T=540
im=Image.open(src).convert('RGB');W,H=im.size
lo=im.resize((8192,4096),Image.LANCZOS).resize((W,H),Image.BILINEAR)
A=np.asarray(im);L=np.asarray(lo)
have=[];eps=6.0
for r in range(H//T):
  for c in range(W//T):
    a=A[r*T:(r+1)*T,c*T:(c+1)*T].astype(np.float32);l=L[r*T:(r+1)*T,c*T:(c+1)*T].astype(np.float32)
    d=(a+eps)/(l+eps)
    e=np.clip(np.round(d*128),0,255).astype(np.uint8)
    Image.fromarray(e).save(f'{out}/{c}_{r}.webp',quality=82,method=6)
    have.append([c,r])
json.dump({"tile":T,"ppd":W/360,"cols":W//T,"rows":H//T,"have":have},open(f'{out}/index.json','w'),separators=(',',':'))
print(len(have))
