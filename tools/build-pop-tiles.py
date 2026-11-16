# Builds the Population map's pictures from GHS-POP R2023A, epoch 2025, 30 arcsecond (about 1 km), WGS84
# (GHS_POP_E2025_GLOBE_R2023A_4326_30ss_V1_0.tif, European Commission JRC, CC BY 4.0,
#  https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/GHSL/GHS_POP_GLOBE_R2023A/GHS_POP_E2025_GLOBE_R2023A_4326_30ss/V1-0/)
# and Natural Earth 10m land + minor islands (public domain) for where the sea is.
#
#   textures/pophr/{0,1,2}/{col}_{row}.webp  tiles of 360 x 360 grey values (lossless), 12, 6 and 3 degrees a tile
#                                            (30, 60 and 120 px a degree; 120 is the data's own 30 arcseconds)
#   textures/pophr/index.json                which tiles exist; a tile not there is all sea, or (listed in "e") all
#                                            land with nobody living there
#   textures/GLOBE_DENS_IMG.webp             the globe picture, 3600 x 1800 (10 px a degree), coloured
#   textures/FLAT_DENS_IMG.webp              the flat map picture, 4000 x 2029, Robinson as the flat map draws it
#
# Grey value g: 0 sea; 1 land with under about 2 people per km2 (all white on the map); else g = 2 + floor(32 * (log10(people per km2) + 1)),
# i.e. 32 steps a factor of ten. The map's 64 colours (DENS_LEVELS in index.html) are 16 a factor of ten from 1 per km2:
# colour n = floor((g - 2) / 2) - 16, clamped to 0..63. People per km2 is people over the land part of each pixel.
# Coarser sizes are worked out from the full one by adding up people and land, so every size agrees.
#
# Usage: python3 -I build-pop-tiles.py GHS.tif ne_10m_land.json ne_10m_minor_islands.json <repo>/textures
import sys,os,json,math
import numpy as np,tifffile
from PIL import Image,ImageDraw
Image.MAX_IMAGE_PIXELS=None
tif,landj,minorj,out=sys.argv[1:5]
P=120;W=360*P;H=180*P;T=360
# the map's colours (DENS_LEVELS.colours in index.html) and the sea of the globe picture (recoloured to the theme's sea)
COL=["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#fffef9","#fefcef","#fefae6","#fef8dd","#fef6d4","#fdf4ca","#fdf2c1","#fdf0b7","#fcedae","#fceaa4","#fce89b","#fbe591","#fbe288","#fade7e","#fad974","#f9d56a","#f9d05f","#f9cc55","#f8c84b","#f7c146","#f7ba42","#f6b43d","#f5ad39","#f4a635","#f39f30","#f2982c","#f09129","#ee8926","#ec8222","#eb7a1f","#e9731b","#e66b1a","#e3631a","#e05c1a","#dd541a","#da4c1a","#d6441a","#d03e19","#c93719","#c13118","#ba2b18","#b32417","#ac1e16","#a51a16","#a01915","#9b1814","#961713","#901512","#8b1412","#861311","#801210","#7b100f","#760f0e","#710e0e","#6d0d0d","#6d0d0d","#6d0d0d","#6d0d0d","#6d0d0d"]
RGB=np.array([[int(h[i:i+2],16) for i in (1,3,5)] for h in COL],np.uint8)
SEA=np.array([111,168,201],np.uint8)

# ---- people a pixel, on the grid 90N..90S, 180W..180E (the file starts 0.0079 degrees west of 180W and 0.9 degrees
#      south of 90N: its column k+1 and row r-108 are this grid's column k and row r, to 1/20 of a pixel) ----
t=tifffile.TiffFile(tif);pg=t.pages[0];sh,sw=pg.shape
tie=pg.tags['ModelTiepointTag'].value;x0,y0=tie[3],tie[4]
dc=round((-180-x0)*P);dr=round((90-y0)*P);print('offset cols',dc,'rows',dr)
C=np.zeros((H,W),np.float32)
for d,idx,shp in pg.segments():
  a=d[0,:,:,0];r0=idx[2];c0=idx[3]
  a=a[:min(256,sh-r0),:min(256,sw-c0)]
  a=np.where(a>0,a,0).astype(np.float32)
  R0=r0+dr;Cc=c0-dc
  rs=max(0,-R0);re_=min(a.shape[0],H-R0);cs=max(0,-Cc);ce=min(a.shape[1],W-Cc)
  if rs<re_ and cs<ce:C[R0+rs:R0+re_,Cc+cs:Cc+ce]+=a[rs:re_,cs:ce]
t.close()
print('people',C.sum(dtype=np.float64)/1e9,'billion')

# ---- land: Natural Earth 10m land and minor islands, and anywhere people live ----
im=Image.new('L',(W,H),0);dr_=ImageDraw.Draw(im)
def ring(cs):return [((x+180)*P,(90-y)*P) for x,y in cs]
for f in (landj,minorj):
  for ft in json.load(open(f))['features']:
    g=ft['geometry'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    for poly in polys:
      dr_.polygon(ring(poly[0]),fill=1)
      for h in poly[1:]:dr_.polygon(ring(h),fill=0)
LAND=np.asarray(im,dtype=np.uint8).copy();del im,dr_
LAND|=(C>0)
print('land share',LAND.mean())

# km2 of one pixel in each row
R=6371.0088;lat=90-np.arange(H+1)/P
ROWA=(R*R*math.radians(1/P)*np.abs(np.sin(np.radians(lat[:-1]))-np.sin(np.radians(lat[1:])))).astype(np.float64)

def grey(people,landpx,area):
  """grey values from people and land pixels (in full-size pixels) over a block"""
  sea=landpx<=0
  d=people/np.maximum(landpx*area,1e-9)
  g=np.where(d>=.1,2+np.minimum(253,np.floor(32*(np.log10(np.maximum(d,1e-9))+1))),1)
  # under 10^(5/16) (about 2) a km2 the map's colour is white (the first five colours): stored as 1, which makes the tiles
  # about a quarter smaller
  g[g<44]=1
  return np.where(sea,0,g).astype(np.uint8)
def colour(g):
  n=np.clip((g.astype(np.int32)-2)//2-16,0,63);n[g<=1]=0
  o=RGB[n];o[g==0]=SEA;return o

# ---- tiles, a band of 3 degrees (360 full-size rows) at a time ----
LV=[(0,4,12),(1,2,6),(2,1,3)]  # level, full-size pixels a pixel, degrees a tile
for lv,_,_ in LV:os.makedirs(f'{out}/pophr/{lv}',exist_ok=True)
idx={'tile':T,'levels':[{'ppd':P//f,'deg':D,'cols':360//D,'rows':180//D,'have':[],'e':[]} for _,f,D in LV]}
BASE=np.zeros((1800,3600),np.uint8);sizes=[0,0,0]
band={0:None,1:None}
for br in range(0,H,360):
  Cb=C[br:br+360].astype(np.float64);Lb=LAND[br:br+360].astype(np.float64);A=ROWA[br:br+360]
  for lv,f,D in LV:
    # people and land added up over f x f blocks; area of a full-size pixel in the middle row of each block (within 0.02%)
    Pf=Cb.reshape(360//f,f,W//f,f).sum((1,3));Lf=Lb.reshape(360//f,f,W//f,f).sum((1,3))
    Af=A.reshape(360//f,f).mean(1)[:,None]
    G=grey(Pf,Lf,Af)
    # a band is 3 degrees; a tile row of this level is D degrees, so it is written once enough bands are in
    if band.get(lv) is None or lv==2:band[lv]=G
    else:band[lv]=np.vstack([band[lv],G])
    rows_need=T
    if band[lv].shape[0]>=rows_need:
      Gt=band[lv][:rows_need];band[lv]=band[lv][rows_need:] if band[lv].shape[0]>rows_need else None
      r=(br+360)//(D*P)-1
      for c in range(360//D):
        q=Gt[:,c*T:(c+1)*T]
        mx=q.max();mn=q.min()
        if mx==0:continue
        if mx==1 and mn==1:idx['levels'][lv]['e'].append(f'{c}_{r}');continue
        p=f'{out}/pophr/{lv}/{c}_{r}.webp';Image.fromarray(q,'L').save(p,lossless=True,quality=100,method=6)
        sizes[lv]+=os.path.getsize(p);idx['levels'][lv]['have'].append(f'{c}_{r}')
  # the globe picture, 12 x 12 blocks
  Pb=Cb.reshape(30,12,3600,12).sum((1,3));Lp=Lb.reshape(30,12,3600,12).sum((1,3))
  # a globe pixel is land when at least a third of it is; one with people is land whatever
  Ab=A.reshape(30,12).mean(1)[:,None]
  g=grey(Pb,Lp,Ab);g[(Lp<48)&(Pb<=0)]=0
  BASE[br//12:br//12+30]=g
  if br%3600==0:print('band',br,sizes)
json.dump(idx,open(f'{out}/pophr/index.json','w'),separators=(',',':'))
print('tile bytes',sizes,sum(sizes)/1e6,'MB','tiles',[len(l['have']) for l in idx['levels']])
Image.fromarray(colour(BASE),'RGB').save(f'{out}/GLOBE_DENS_IMG.webp',lossless=True,method=6)
np.save(os.path.join(os.path.dirname(os.path.abspath(tif)),'base_grey.npy'),BASE)

# ---- the flat map picture: Robinson (d3.geoRobinsonRaw), scale 318.31, centre (1000, 500.5), frame x 0..2000,
#      y -6.688..1007.688 drawn into 4000 x 2029; sea see-through ----
K=[[0.9986,-0.062],[1.0000,0.0000],[0.9986,0.0620],[0.9954,0.1240],[0.9900,0.1860],[0.9822,0.2480],[0.9730,0.3100],[0.9600,0.3720],[0.9427,0.4340],[0.9216,0.4958],[0.8962,0.5571],[0.8679,0.6176],[0.8350,0.6769],[0.7986,0.7346],[0.7597,0.7903],[0.7186,0.8435],[0.6732,0.8936],[0.6213,0.9394],[0.5722,0.9761],[0.5322,1.0000]]
for k in K:k[1]*=1.0144
def rob(phi):
  i=min(18,abs(phi)*36/math.pi);i0=int(math.floor(i));di=i-i0
  ax,ay=K[i0];bx,by=K[i0+1];cx,cy=K[min(19,i0+2)]
  return (bx+di*(cx-ax)/2+di*di*(cx-2*bx+ax)/2, math.copysign(math.pi/2,phi if phi!=0 else 1)*(by+di*(cy-ay)/2+di*di*(cy-2*by+ay)/2))
ph=np.radians(np.linspace(-90,90,180001));RX=np.array([rob(p)[0] for p in ph]);RY=np.array([rob(p)[1] for p in ph])
FW,FH,SC=4000,2029,318.31
# the flat picture is about 11 px a degree: each of its pixels takes its colour from the 30 px-a-degree values, averaged
# over the 3 x 3 nearest (people and land added up again, as above)
f=4;Pq=C.reshape(H//f,f,W//f,f).sum((1,3),dtype=np.float64);Lq=LAND.reshape(H//f,f,W//f,f).sum((1,3)).astype(np.float64)
del C,LAND
from numpy.lib.stride_tricks import sliding_window_view as swv
def box3(a):p=np.pad(a,((1,1),(1,1)),mode='wrap');return swv(p,(3,3)).sum((2,3))
P3=box3(Pq);L3=box3(Lq);Aq=ROWA.reshape(H//f,f).mean(1)[:,None]
G3=grey(P3,L3,Aq);G1=grey(Pq,Lq,Aq)
G3[G1==0]=0  # keep the coast where it is
ys=(np.arange(FH)+.5)/FH*1014.376-6.688;xs=(np.arange(FW)+.5)/FW*2000
ry=(500.5-ys)/SC;phi=np.interp(ry,RY,ph,left=np.nan,right=np.nan)
OUT=np.zeros((FH,FW,4),np.uint8);Q=360*P//f
for y in range(FH):
  if not np.isfinite(phi[y]):continue
  rx=rob(phi[y])[0];lam=(xs-1000)/(SC*rx)
  ok=np.abs(lam)<=math.pi
  la=np.degrees(phi[y]);lo=np.degrees(lam)
  r=min(H//f-1,max(0,int((90-la)/180*(H//f))));cc=np.clip(((lo+180)/360*Q).astype(int),0,Q-1)
  g=G3[r,cc];o=colour(g);a=np.where(ok&(g>0),255,0).astype(np.uint8)
  OUT[y,:,:3]=np.where(a[:,None]>0,o,0);OUT[y,:,3]=a
Image.fromarray(OUT,'RGBA').save(f'{out}/FLAT_DENS_IMG.webp',lossless=True,method=6)
print('done')
