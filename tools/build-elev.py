# Builds the globe's Elevation picture (textures/GLOBE_ELEV_IMG_B.webp, 4096 x 2048) from the same heights the close-up
# layer uses (AWS Terrain Tiles, terrarium zoom 5), with one colour per height and the same north-west shading, so the
# zoomed-out globe is the close-up seen from afar. The colour for each height is taken once from the old picture (the
# median colour it gave that height), saved to tools/elev-ramp.json for geoflock-elevhr.js.
# Usage: python3 build-elev.py <dir of 5_x_y.png tiles> <old picture> <out picture>
import sys,json,numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
T,old,out=sys.argv[1:4]
M=np.zeros((8192,8192),np.float32)
for x in range(32):
  for y in range(32):
    a=np.asarray(Image.open(f'{T}/{x}_{y}.png').convert('RGB')).astype(np.float32)
    M[y*256:(y+1)*256,x*256:(x+1)*256]=a[...,0]*256+a[...,1]+a[...,2]/256-32768
W,H=4096,2048
lat=90-(np.arange(H)+.5)*180/H;lat=np.clip(lat,-85.05,85.05)
yy=(1-np.log(np.tan(np.radians(lat))+1/np.cos(np.radians(lat)))/np.pi)/2*8192
xx=(np.arange(W)+.5)/W*8192
# area average: each output pixel covers ~2 mercator pixels across, more toward the poles; take a 3x3 mean then sample
from scipy.ndimage import uniform_filter
Ms=uniform_filter(M,3,mode='wrap')
yi=np.clip(yy.astype(int),0,8191);xi=np.clip(xx.astype(int),0,8191)
Hm=Ms[yi][:,xi]
P=np.asarray(Image.open(old).convert('RGB').resize((W,H),Image.BILINEAR)).astype(np.float32)
sea=(Hm<0)&(P[...,2]>P[...,0]+25)
# the Elevation map's own colour stops (index.html ELEV_LAND_STOPS / ELEV_SEA_STOPS), as its legend shows
LAND=[[0,"#5f9f72"],[100,"#86b97a"],[250,"#b4d28a"],[500,"#e6e2a0"],[800,"#f1cf86"],[1200,"#e5a96b"],[1800,"#cc8558"],[2500,"#a8654b"],[3500,"#8a5a57"],[4500,"#a7979c"],[5500,"#e2dfe6"],[7000,"#ffffff"]]
SEA=[[-11000,"#183660"],[-6000,"#265084"],[-4000,"#3668a0"],[-2000,"#4c85ba"],[-1000,"#69a0cd"],[-200,"#96c1e0"],[0,"#bedaee"]]
def ramp(stops,h):
  xs=[a for a,_ in stops];cs=np.array([[int(c[i:i+2],16) for i in (1,3,5)] for _,c in stops],float)
  return np.stack([np.interp(h,xs,cs[:,k]) for k in range(3)],-1)
col=np.where(sea[...,None],ramp(SEA,np.minimum(Hm,0)),ramp(LAND,np.maximum(Hm,0)))

# shading: light from the north-west, as the close-up layer (geoflock-elevhr.js)
dx=(2*np.pi*6371000/W)*np.cos(np.radians(lat))[:,None];dy=np.pi*6371000/H
gx=(np.roll(Hm,-1,1)-np.roll(Hm,1,1))/(2*dx);gy=(np.vstack([Hm[:1],Hm[:-2],Hm[-1:]])*0+0)
up=np.vstack([Hm[:1],Hm[:-1]]);dn=np.vstack([Hm[1:],Hm[-1:]]);gy=(up-dn)/(2*dy)
L=np.array([-.5,.5,.707]);land=~sea;ex=np.where(land,6.0,.8)
nl=np.sqrt((gx*ex)**2+(gy*ex)**2+1);dot=(-gx*ex*L[0]-gy*ex*L[1]+L[2])/nl
sh=np.clip(1+np.where(land,1.25,.6)*(dot-L[2]),.5,1.35)
img=np.clip(col*sh[...,None],0,255).astype(np.uint8)
Image.fromarray(img).save(out,quality=90)
print('ok')
