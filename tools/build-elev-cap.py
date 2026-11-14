# Redraws the polar cap of the Elevation map's zoomed-out picture (textures/GLOBE_ELEV_IMG_B.webp, north of 84 N).
#
# The Terrain Tiles build-elev.py reads stop at 85.05 degrees (Web Mercator), so it repeated their last row up to the pole:
# every picture row north of 85 N was the same row, which on the globe drew a pinwheel of wedges round the North Pole. (Its
# 3x3 mean also wrapped top to bottom, so the rows near 85 N were mixed with Antarctica's.) North of 84 N the picture is
# redrawn from ETOPO1 (NOAA, public domain, 1 arc-minute) in the same colours and shading, blended in from 83.5 N.
# Antarctica south of 85 S is ice, where build-elev.py kept the old picture, so the south cap was already right.
#
# ETOPO1 from NOAA's ERDDAP, 2-degree bands, every minute of latitude and every second minute of longitude:
#   https://coastwatch.pfeg.noaa.gov/erddap/griddap/etopo180.nc?altitude[(A):1:(A+2)][(-180):2:(180)]
#   for A in 82,84,86,88
# Usage: python3 build-elev-cap.py <dir of c_A.nc> <repo root>   (run once on the picture build-elev.py made)
import sys, os, numpy as np
from scipy.io import netcdf_file
from scipy.ndimage import map_coordinates
from PIL import Image

src, root = sys.argv[1:3]

def band(lats):
    rows, la = [], []
    for a in lats:
        f = netcdf_file(os.path.join(src, f'c_{a}.nc'), 'r', mmap=False)
        y = f.variables['latitude'].data.astype(float); d = f.variables['altitude'].data.astype(np.float32)
        k = slice(0, -1) if a != lats[-1] else slice(None)  # bands share their edge row
        rows.append(d[k]); la.append(y[k]); lon = f.variables['longitude'].data.astype(float); f.close()
    return np.concatenate(la), lon, np.concatenate(rows)

N_LA, LON, N_H = band(list(range(82, 89, 2)))
assert abs(LON[0] + 180) < 1e-6 and abs(LON[1] - LON[0] - 1 / 30) < 1e-6

def sample(LA, H, lon, lat):
    """bilinear ETOPO1 height at lon/lat (arrays)"""
    fy = (lat - LA[0]) / (LA[1] - LA[0]); fx = (np.mod(lon + 180, 360)) * 30
    return map_coordinates(H, [fy, fx], order=1, mode='nearest')

# --- the picture's north cap ---
pic = os.path.join(root, 'textures', 'GLOBE_ELEV_IMG_B.webp')
P = np.asarray(Image.open(pic).convert('RGB')).astype(np.float32)
Hh, W = P.shape[:2]
r1 = int(np.ceil((90 - 83.5) / 180 * Hh))           # rows 0..r1-1 are redrawn (north of 83.5 N), blended 83.5 -> 84 N
lat = 90 - (np.arange(-1, r1 + 1) + 0.5) * 180 / Hh
lon = (np.arange(W) + 0.5) / W * 360 - 180
LG, LT = np.meshgrid(lon, lat)
# average over the picture pixel (about 2.6 x 1.3 ETOPO1 cells at 84 N, more toward the pole)
Hm = np.zeros_like(LG)
for oy in (-.25, .25):
    for ox in (-.375, -.125, .125, .375):
        Hm += sample(N_LA, N_H, LG + ox * 360 / W, np.minimum(89.999, LT + oy * 180 / Hh))
Hm /= 8
LAND = [[0, "#5f9f72"], [100, "#86b97a"], [250, "#b4d28a"], [500, "#e6e2a0"], [800, "#f1cf86"], [1200, "#e5a96b"], [1800, "#cc8558"], [2500, "#a8654b"], [3500, "#8a5a57"], [4500, "#a7979c"], [5500, "#e2dfe6"], [7000, "#ffffff"]]
SEA = [[-11000, "#183660"], [-6000, "#265084"], [-4000, "#3668a0"], [-2000, "#4c85ba"], [-1000, "#69a0cd"], [-200, "#96c1e0"], [0, "#bedaee"]]
def ramp(stops, h):
    xs = [a for a, _ in stops]; cs = np.array([[int(c[i:i + 2], 16) for i in (1, 3, 5)] for _, c in stops], float)
    return np.stack([np.interp(h, xs, cs[:, k]) for k in range(3)], -1)
sea = Hm < 0
col = np.where(sea[..., None], ramp(SEA, np.minimum(Hm, 0)), ramp(LAND, np.maximum(Hm, 0)))
# shading as build-elev.py; the east-west step shrinks toward the pole (kept above a pixel's height there)
dx = np.maximum((2 * np.pi * 6371000 / W) * np.cos(np.radians(lat)), np.pi * 6371000 / Hh)[:, None]; dy = np.pi * 6371000 / Hh
gx = (np.roll(Hm, -1, 1) - np.roll(Hm, 1, 1)) / (2 * dx)
up = np.vstack([Hm[:1], Hm[:-1]]); dn = np.vstack([Hm[1:], Hm[-1:]]); gy = (up - dn) / (2 * dy)
L = np.array([-.5, .5, .707]); ex = np.where(sea, .8, 6.0)
nl = np.sqrt((gx * ex) ** 2 + (gy * ex) ** 2 + 1); dot = (-gx * ex * L[0] - gy * ex * L[1] + L[2]) / nl
sh = np.clip(1 + np.where(sea, .6, 1.25) * (dot - L[2]), .5, 1.35)
new = np.clip(col * sh[..., None], 0, 255)[1:r1 + 1]
w = np.clip((lat[1:r1 + 1] - 83.5) / .5, 0, 1)[:, None, None]
P[:r1] = P[:r1] * (1 - w) + new * w
Image.fromarray(np.clip(P + .5, 0, 255).astype(np.uint8)).save(pic, quality=90, method=6)
print('cap rows', r1)
