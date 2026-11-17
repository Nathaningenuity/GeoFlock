#!/usr/bin/env python3
"""Build textures/SEAICE_POLAR.png: sea-ice concentration for the Satellite map (globe shader and flat strips).

Data (real, nothing invented):
  * Sea-ice concentration: University of Bremen, AMSR2 ASI algorithm, daily 3.125 km hemispheric grids, v5.4
    (Spreen, G., L. Kaleschke and G. Heygster (2008), Sea ice remote sensing using AMSR-E 89 GHz channels,
    J. Geophys. Res. 113, C02S03, doi:10.1029/2005JC003384). Free download from https://seaice.uni-bremen.de/data/
    (data.seaice.uni-bremen.de), e.g.
      amsr2/asi_daygrid_swath/n3125/2026/sep/Arctic3125/asi-AMSR2-n3125-20260912-v5.4.tif
      amsr2/asi_daygrid_swath/s3125/2026/feb/Antarctic3125/asi-AMSR2-s3125-20260226-v5.4.tif
    GeoTIFF values 0-100 %, 120 = land / no data. The grids are NSIDC polar stereographic on WGS 84, read from each
    file's own GeoTIFF tags: north EPSG:3413 (true scale 70N, central meridian 45W), south EPSG:3976 (true scale
    70S, central meridian 0), 3125 m cells.
    The 2026 minima (NSIDC): Arctic 12 September 2026 (4.60 million km2), Antarctic 26 February 2026 (2.58 million
    km2). Seven daily files centred on each are averaged: Arctic 9-15 September 2026, Antarctic 23 February -
    1 March 2026, so that no single noisy day decides the edge.
  * Antarctic ice shelves: Natural Earth 1:10m "ne_10m_antarctic_ice_shelves_polys" (public domain),
    https://github.com/nvkelso/natural-earth-vector/tree/master/geojson

Output (2 x N by N, default N = 2048): two squares, left Arctic, right Antarctic, azimuthal equidistant centred on the
pole, out to 30 degrees from it (latitude 60). In a square, with r = (90 - |lat|) / 30 and lon in radians:
  Arctic:    x = 0.5 + 0.5 r sin(lon), y = 0.5 + 0.5 r cos(lon)     (y down the image)
  Antarctic: x = 0.5 + 0.5 r sin(lon), y = 0.5 - 0.5 r cos(lon)
Channels: R = concentration (0-255 = 0-100 %), G = ice shelf (Natural Earth), B = open sea in the AMSR2 grid
(255 = sea, 0 = land), so the globe can keep sea ice off land.

Usage (downloads kept outside the repo; run with python3 -I):
  python3 -I tools/build-seaice-amsr2.py --asi DIR_WITH_TIFS --shelves ne_10m_antarctic_ice_shelves_polys.geojson \
      --out textures/SEAICE_POLAR.png
To fetch the files (from any empty folder):
  B=https://data.seaice.uni-bremen.de/amsr2/asi_daygrid_swath
  for d in 09 10 11 12 13 14 15; do curl -fO $B/n3125/2026/sep/Arctic3125/asi-AMSR2-n3125-202609$d-v5.4.tif; done
  for d in 23 24 25 26 27 28; do curl -fO $B/s3125/2026/feb/Antarctic3125/asi-AMSR2-s3125-202602$d-v5.4.tif; done
  curl -fO $B/s3125/2026/mar/Antarctic3125/asi-AMSR2-s3125-20260301-v5.4.tif
"""
import argparse, glob, json, math, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

A_WGS84 = 6378137.0
E_WGS84 = 0.0818191908426215
RMAX = 30.0  # degrees from the pole covered by each square


def polar_stereo(lat, lon, lat_ts, lon0):
    """Forward polar stereographic on the WGS 84 ellipsoid (Snyder 1987, eqs 21-33, 21-34, 15-9, 14-15).
    lat/lon/lat_ts/lon0 in degrees; returns metres (x, y) as in EPSG:3413 / 3976 / 3031."""
    south = lat_ts < 0
    phi = np.radians(-lat if south else lat)
    lam = np.radians(-lon if south else lon)
    lam0 = math.radians(-lon0 if south else lon0)
    phic = math.radians(abs(lat_ts))
    e = E_WGS84

    def t(p):
        s = np.sin(p)
        return np.tan(np.pi / 4 - p / 2) / ((1 - e * s) / (1 + e * s)) ** (e / 2)

    mc = math.cos(phic) / math.sqrt(1 - e * e * math.sin(phic) ** 2)
    rho = A_WGS84 * mc * t(phi) / t(phic)
    x = rho * np.sin(lam - lam0)
    y = -rho * np.cos(lam - lam0)
    return (-x, -y) if south else (x, y)


def square_latlon(n, south):
    """lat, lon (degrees) of every pixel centre of one n x n square; valid = inside the disc."""
    q = (np.arange(n) + 0.5) / n
    X, Y = np.meshgrid(2 * q - 1, 2 * q - 1)
    r = np.hypot(X, Y)
    lon = np.degrees(np.arctan2(X, -Y if south else Y))
    lat = 90 - r * RMAX
    if south:
        lat = -lat
    return lat, lon, r <= 1.0


def read_geotiff(path):
    im = Image.open(path)
    a = np.array(im)
    tags = im.tag_v2
    sx, sy = tags[33550][0], tags[33550][1]
    tp = tags[33922]
    geokeys = tags[34735]
    epsg = None
    for i in range(4, len(geokeys), 4):
        if geokeys[i] == 3072:  # ProjectedCSTypeGeoKey
            epsg = geokeys[i + 3]
    # PixelIsArea (GTRasterTypeGeoKey 1025 = 1): the tie point is the outer corner of the first pixel
    return a, dict(x0=tp[3] - tp[0] * sx, y0=tp[4] + tp[1] * sy, dx=sx, dy=sy, epsg=epsg)


PROJ = {3413: (70.0, -45.0), 3976: (-70.0, 0.0), 3411: (70.0, -45.0), 3412: (-70.0, 0.0)}


def week_mean(files):
    stack, geo = [], None
    for f in sorted(files):
        a, g = read_geotiff(f)
        if geo is None:
            geo = g
        assert g == geo, f"grid differs: {f}"
        stack.append(a)
    s = np.stack(stack).astype(np.float32)
    if s.max() > 120:  # older files: 0-200 for 0-100 %, 255 = land / no data
        s = np.where(s == 255, 120, s / 2)
    valid = s <= 100
    n = valid.sum(0)
    conc = np.where(n > 0, (s * valid).sum(0) / np.maximum(n, 1), np.nan)
    land = (s == 120).sum(0) > len(files) / 2
    print(f"  {len(files)} days, grid {s.shape[2]}x{s.shape[1]}, EPSG:{geo['epsg']}, land {land.mean():.2%}")
    return conc, land, geo


def sample(grid, geo, lat, lon, order=1):
    lat_ts, lon0 = PROJ[geo["epsg"]]
    x, y = polar_stereo(lat, lon, lat_ts, lon0)
    col = (x - geo["x0"]) / geo["dx"] - 0.5
    row = (geo["y0"] - y) / geo["dy"] - 0.5
    return ndimage.map_coordinates(grid, [row, col], order=order, mode="nearest")


def build_square(files, n, south):
    conc, land, geo = week_mean(files)
    # the pole hole (no satellite overpass right at the North Pole) is marked 120 like land: it is sea
    lat_ts, lon0 = PROJ[geo["epsg"]]
    h, w = land.shape
    gx = geo["x0"] + (np.arange(w) + 0.5) * geo["dx"]
    gy = geo["y0"] - (np.arange(h) + 0.5) * geo["dy"]
    near_pole = np.hypot(*np.meshgrid(gx, gy)) < 400e3
    if lat_ts > 0:
        land &= ~near_pole
    sea = ~land
    # cells with no value on any day (inside the sea) and land cells take the nearest sea value, so the bilinear
    # edge does not dip at the coast; the B channel keeps the ice off land
    bad = np.isnan(conc)
    _, (ri, ci) = ndimage.distance_transform_edt(bad, return_indices=True)
    filled = conc[ri, ci]
    lat, lon, inside = square_latlon(n, south)
    c = sample(filled, geo, lat, lon) / 100.0
    s = sample(sea.astype(np.float32), geo, lat, lon)
    c = np.where(inside, np.clip(c, 0, 1), 0)
    s = np.where(inside, np.clip(s, 0, 1), 0)
    # keep the concentration only on and next to the sea (3 pixels into land, for a clean bilinear edge), and drop
    # values under 5 % (well below the 15 % edge the map draws), which are mostly weather noise: smaller file
    near_sea = ndimage.binary_dilation(s > 0.02, iterations=3)
    c = np.where(near_sea & (c >= 0.05), c, 0)
    return c, s


def shelves_square(path, n, south, ss=4):
    """Natural Earth ice shelves rasterised into the square (antialiased by supersampling)."""
    if not south:
        return np.zeros((n, n), np.float32)
    m = n * ss
    img = Image.new("L", (m, m), 0)
    d = ImageDraw.Draw(img)
    gj = json.load(open(path))

    def px(ring):
        out = []
        for lon, lat in ring:
            r = (90 + lat) / RMAX
            L = math.radians(lon)
            out.append(((0.5 + 0.5 * r * math.sin(L)) * m, (0.5 - 0.5 * r * math.cos(L)) * m))
        return out

    for f in gj["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            d.polygon(px(poly[0]), fill=255)
            for hole in poly[1:]:
                d.polygon(px(hole), fill=0)
    return np.array(img.resize((n, n), Image.BOX), np.float32) / 255.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--asi", required=True, help="folder with the asi-AMSR2-[ns]3125-YYYYMMDD-v5.4.tif files")
    ap.add_argument("--shelves", required=True, help="ne_10m_antarctic_ice_shelves_polys.geojson")
    ap.add_argument("--out", required=True)
    ap.add_argument("--size", type=int, default=2048)
    a = ap.parse_args()
    n = a.size
    out = np.zeros((n, 2 * n, 3), np.uint8)
    for south, key in ((False, "n3125"), (True, "s3125")):
        files = glob.glob(os.path.join(a.asi, f"asi-AMSR2-{key}-*.tif"))
        print(("Antarctic" if south else "Arctic"), [os.path.basename(f)[16:24] for f in sorted(files)])
        c, s = build_square(files, n, south)
        sh = shelves_square(a.shelves, n, south)
        o = n if south else 0
        out[:, o:o + n, 0] = np.round(c * 255)
        out[:, o:o + n, 1] = np.round(sh * 255)
        out[:, o:o + n, 2] = np.round(s * 255)
        # rough check against NSIDC's extent: area of cells >= 15 % (each pixel (2 * RMAX * 111.2 km / n)^2,
        # azimuthal equidistant areas are a little stretched away from the pole, so this is approximate)
        lat, lon, inside = square_latlon(n, south)
        colat = np.radians(90 - np.abs(lat))
        k = np.where(colat > 0, np.sin(colat) / np.maximum(colat, 1e-9), 1)
        pa = (2 * RMAX * 111.195 / n) ** 2 * k
        print(f"  extent (>=15 %, sea only) ~ {((c >= 0.15) * (s > 0.5) * pa).sum() / 1e6:.2f} million km2")
    Image.fromarray(out, "RGB").save(a.out, optimize=True)
    print("wrote", a.out, os.path.getsize(a.out), "bytes")


if __name__ == "__main__":
    main()
