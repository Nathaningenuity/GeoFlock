#!/usr/bin/env python3
"""Build textures/SEAICE_PHOTO.webp: a mostly cloud-free satellite photo of the sea ice, for the Satellite map.

Data (real, nothing invented): NASA GIBS (Global Imagery Browse Services, https://gibs.earthdata.nasa.gov), daily
Corrected Reflectance mosaics in the polar projections, WMTS tile matrix set "250m", level 2 (2048 m per pixel):
  EPSG:3413 (Arctic, polar stereographic, true scale 70N, central meridian 45W) and
  EPSG:3031 (Antarctic, polar stereographic, true scale 71S, central meridian 0).
Five satellites, each as a true-colour picture and a false-colour picture with a short-wave infrared band:
  MODIS Terra / Aqua:           *_CorrectedReflectance_TrueColor + *_CorrectedReflectance_Bands721
  VIIRS Suomi NPP / NOAA-20/21: *_CorrectedReflectance_TrueColor + *_CorrectedReflectance_BandsM11-I2-I1
(layer names checked against the GetCapabilities documents). NASA imagery is free to use with credit:
"We acknowledge the use of imagery provided by services from NASA's Global Imagery Browse Services (GIBS), part of
NASA's Earth Science Data and Information System (ESDIS)."
Days: the same weeks as the concentration in SEAICE_POLAR.png (tools/build-seaice-amsr2.py), around the 2026
minima: Arctic 9-15 September 2026, Antarctic 23 February - 1 March 2026.

Clouds vs ice: in both false-colour pictures red is the 2.1-2.25 um band (MODIS band 7, VIIRS M11) and green the
0.86 um near infrared (MODIS band 2, VIIRS I2). Snow and ice are bright in the near infrared but dark at 2.1 um
(they show cyan); water clouds are bright in both (white); open water is dark in both. Per pixel and per picture the
score green - 1.5 * red is high for clear ice, near zero for clear water and negative for cloud, so for every pixel
the clearest of the 35 pictures (5 satellites x 7 days) is taken (a soft maximum over a blurred score, so
the choice changes smoothly between neighbouring pixels, no patchwork). Each satellite's own daily sea-ice product on
GIBS (MODIS_*_Sea_Ice = MOD29/MYD29, VIIRS_*_Sea_Ice, both with the satellite's cloud mask) says per pixel whether
the sky was clear (sea ice or open ocean), cloudy or undecided (night, no decision); cloudy pictures are left out and
undecided ones count far less. (VIIRS_NOAA21_Sea_Ice is listed in GetCapabilities but returned "TIME does not exist"
for these dates, so NOAA-21 only fills in where nothing flagged clear exists.) Where even the best picture is cloudy
or there is no picture (no sun), the alpha channel is low and the map falls back to its drawn floe pattern.

Output: RGBA, same layout as SEAICE_POLAR.png (two squares, left Arctic, right Antarctic, azimuthal equidistant to
latitude 60): RGB = true colour, A = confidence that the pixel is a clear photo (0 where there is no ice).

Usage (python3 -I; downloads go to --cache, outside the repo):
  python3 -I tools/build-seaice-photo.py --polar textures/SEAICE_POLAR.png --cache DIR --out textures/SEAICE_PHOTO.webp
"""
import argparse, concurrent.futures as cf, datetime as dt, io, math, os, subprocess, sys
import numpy as np
sys.dont_write_bytecode = True  # importing build-seaice-amsr2.py must not leave a __pycache__ in the repo
from PIL import Image
from scipy import ndimage

import importlib.util
_spec = importlib.util.spec_from_file_location("amsr2", os.path.join(os.path.dirname(os.path.abspath(__file__)), "build-seaice-amsr2.py"))
amsr2 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(amsr2)

GIBS = "https://gibs.earthdata.nasa.gov/wmts/epsg{epsg}/best/{layer}/default/{date}/{tms}/{z}/{row}/{col}.{ext}"
HALF = 4194304.0  # half the side of the GIBS polar grids, metres
SENSORS = [  # true colour, false colour, sea-ice classification (clear-sky sea ice / ocean / cloud / night ...)
    ("MODIS_Terra_CorrectedReflectance_TrueColor", "MODIS_Terra_CorrectedReflectance_Bands721", "MODIS_Terra_Sea_Ice"),
    ("MODIS_Aqua_CorrectedReflectance_TrueColor", "MODIS_Aqua_CorrectedReflectance_Bands721", "MODIS_Aqua_Sea_Ice"),
    ("VIIRS_SNPP_CorrectedReflectance_TrueColor", "VIIRS_SNPP_CorrectedReflectance_BandsM11-I2-I1", "VIIRS_SNPP_Sea_Ice"),
    ("VIIRS_NOAA20_CorrectedReflectance_TrueColor", "VIIRS_NOAA20_CorrectedReflectance_BandsM11-I2-I1", "VIIRS_NOAA20_Sea_Ice"),
    ("VIIRS_NOAA21_CorrectedReflectance_TrueColor", "VIIRS_NOAA21_CorrectedReflectance_BandsM11-I2-I1", "VIIRS_NOAA21_Sea_Ice"),
]
# colours of the *_Sea_Ice classification tiles (GIBS colour maps MODIS_L2_Sea_Ice and VIIRS_Sea_Ice)
CLEAR_RGB = [(255, 100, 100), (35, 35, 117)]  # sea ice, ocean (clear sky)
CLOUD_RGB = [(0, 191, 255), (100, 200, 255)]  # cloud
HEMI = {
    False: dict(epsg=3413, lat_ts=70.0, lon0=-45.0, days=("2026-09-09", 7)),
    True: dict(epsg=3031, lat_ts=-71.0, lon0=0.0, days=("2026-02-23", 7)),
}
UA = "GeoFlock-build/1.0 (educational map app)"


def days(start, n):
    d0 = dt.date.fromisoformat(start)
    return [(d0 + dt.timedelta(days=i)).isoformat() for i in range(n)]


def fetch(url, path):
    if os.path.exists(path):
        return path
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".part"
    r = subprocess.run(["curl", "-sS", "-f", "-A", UA, "--retry", "3", "--max-time", "120", "-o", tmp, url])
    if r.returncode != 0:
        open(path, "wb").close()  # remember "no tile"
        if os.path.exists(tmp):
            os.remove(tmp)
        return path
    os.replace(tmp, path)
    return path


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def tile_path(cache, epsg, layer, d, level, r, c):
    ext = "png" if layer.endswith("Sea_Ice") else "jpg"
    return os.path.join(cache, f"epsg{epsg}", layer, d, f"{level}_{r}_{c}.{ext}")


def build_square(conc, seamask, n, south, cache, level, workers):
    H = HEMI[south]
    res = 8192.0 / 2 ** level
    ntile = 2 * 2 ** level
    lat, lon, inside = amsr2.square_latlon(n, south)
    # pixels that need a photo: inside the 15 % edge, plus a margin of a few pixels
    need = ndimage.binary_dilation((conc >= 0.12) & (seamask > 0.02), iterations=4) & inside
    iy, ix = np.nonzero(need)
    x, y = amsr2.polar_stereo(lat[iy, ix], lon[iy, ix], H["lat_ts"], H["lon0"])
    gc = (x + HALF) / res - 0.5  # GIBS pixel column / row (pixel centres)
    gr = (HALF - y) / res - 0.5
    tiles = sorted({(int(r) // 512, int(c) // 512) for r, c in zip(gr, gc)} |
                   {(int(r + 1) // 512, int(c + 1) // 512) for r, c in zip(gr, gc)})
    tiles = [(r, c) for r, c in tiles if 0 <= r < ntile and 0 <= c < ntile]
    print(f"  {need.sum()} pixels, {len(tiles)} tiles per picture")
    jobs = []
    for d in days(*H["days"]):
        for pair in SENSORS:
            for layer in pair:
                si = layer.endswith("Sea_Ice")
                for r, c in tiles:
                    url = GIBS.format(epsg=H["epsg"], layer=layer, date=d, tms="1km" if si else "250m", z=level, row=r, col=c,
                                      ext="png" if si else "jpg")
                    jobs.append((url, tile_path(cache, H["epsg"], layer, d, level, r, c)))
    with cf.ThreadPoolExecutor(workers) as ex:
        list(ex.map(lambda j: fetch(*j), jobs))

    def mosaic(layer, d):
        big = np.zeros((ntile * 512, ntile * 512, 3), np.uint8)
        for r, c in tiles:
            p = tile_path(cache, H["epsg"], layer, d, level, r, c)
            if os.path.getsize(p):
                big[r * 512:(r + 1) * 512, c * 512:(c + 1) * 512] = np.array(Image.open(p).convert("RGB"))
        return big

    def classes(layer, d):
        """1 = clear (sea ice or ocean), -1 = cloud, 0 = anything else (night, no decision, missing)"""
        big = mosaic(layer, d)
        k = np.zeros(big.shape[:2], np.int8)
        for rgb in CLEAR_RGB:
            k[(big == rgb).all(-1)] = 1
        for rgb in CLOUD_RGB:
            k[(big == rgb).all(-1)] = -1
        return k

    def at(big, ch):
        return ndimage.map_coordinates(big[..., ch], [gr, gc], order=1, mode="constant").astype(np.float32)

    T = 12.0  # softness of the per-pixel choice (score units, 0-255 scale)
    m = np.full(len(iy), -1e3, np.float32)
    accw = np.zeros(len(iy), np.float32)
    acc = np.zeros((len(iy), 3), np.float32)
    for d in days(*H["days"]):
        for tc_l, fc_l, si_l in SENSORS:
            tc, fc = mosaic(tc_l, d), mosaic(fc_l, d)
            cls = ndimage.map_coordinates(classes(si_l, d), [np.round(gr), np.round(gc)], order=0, mode="constant")
            # no data (night, gaps between swaths) is black in both pictures; keep 2 pixels away from it (JPEG edges)
            nod = (tc.max(-1) < 6) & (fc.max(-1) < 6)
            nod = ndimage.binary_dilation(nod, iterations=2)
            valid = ndimage.map_coordinates(nod.astype(np.float32), [gr, gc], order=0, mode="constant", cval=1) < 0.5
            rgb = np.stack([at(tc, k) for k in range(3)], -1)
            score = at(fc, 1) - 1.5 * at(fc, 0)
            # snow and ice are neutral to bluish in true colour; with the sun very low (near the pole in mid-September)
            # the pictures turn yellow-green: prefer a neutral picture where one exists
            score -= 3.0 * np.maximum(0, rgb[:, 1] - rgb[:, 2] - 3) + 3.0 * np.maximum(0, rgb[:, 0] - rgb[:, 2] - 3)
            # blur the score (4 px) so the choice of picture is coherent between neighbours
            S2 = np.full((n, n), np.nan, np.float32)
            S2[iy, ix] = np.where(valid, score, np.nan)
            ok = ~np.isnan(S2)
            num = ndimage.gaussian_filter(np.where(ok, S2, 0), 4.0)
            den = ndimage.gaussian_filter(ok.astype(np.float32), 4.0)
            sb = np.where(valid, num[iy, ix] / np.maximum(den[iy, ix], 1e-3), -1e3)
            # the satellite's own clear-sky test (MODIS MOD29 / VIIRS sea-ice product, with its cloud mask):
            # cloud is left out; undecided (night, no decision, missing) only fills in where nothing clear exists, below
            # the confidence threshold
            sb = np.where(cls == -1, -1e3, np.where(cls == 1, sb + 100.0, sb - 130.0))
            valid &= cls != -1
            mn = np.maximum(m, sb)
            k_old = np.exp((m - mn) / T)
            w = np.exp((sb - mn) / T) * valid
            acc = acc * k_old[:, None] + w[:, None] * rgb
            accw = accw * k_old + w
            m = mn
            print(f"   {d} {tc_l.split('_')[1]:6s} valid {valid.mean():.0%}  flagged clear {np.mean(cls == 1):.0%}  clear-ice {np.mean(sb > 60):.0%}", flush=True)
    rgb = acc / np.maximum(accw, 1e-6)[:, None]
    out = np.zeros((n, n, 4), np.float32)
    out[iy, ix, :3] = rgb
    # confidence from the best score: a pixel flagged clear by the satellite's own product gets +100, so clear ice
    # (score 120-200) and clear open water between floes (0-20) both count, while a pixel flagged clear that still
    # looks like cloud (score below about -40) does not; unflagged pictures (-130) never reach it.
    conf = smoothstep(60.0, 100.0, m) * (accw > 0)
    out[iy, ix, 3] = conf * 255
    # under low confidence the colour is of no use: take the nearest confident colour instead, so the texture's
    # bilinear filtering never pulls cloud or black into the edge of the photo
    good = out[..., 3] >= 128
    if good.any():
        _, (ri, ci) = ndimage.distance_transform_edt(~good, return_indices=True)
        fill = need & ~good
        out[fill, :3] = out[ri[fill], ci[fill], :3]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--polar", required=True, help="SEAICE_POLAR.png from build-seaice-amsr2.py")
    ap.add_argument("--cache", required=True, help="folder for the downloaded tiles (outside the repo)")
    ap.add_argument("--out", required=True)
    ap.add_argument("--level", type=int, default=2)
    ap.add_argument("--quality", type=int, default=82)
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--debug", help="also save the raw RGBA as PNG here")
    a = ap.parse_args()
    P = np.array(Image.open(a.polar).convert("RGB")).astype(np.float32) / 255
    n = P.shape[0]
    out = np.zeros((n, 2 * n, 4), np.float32)
    for south in (False, True):
        print("Antarctic" if south else "Arctic")
        o = n if south else 0
        out[:, o:o + n] = build_square(P[:, o:o + n, 0], P[:, o:o + n, 2], n, south, a.cache, a.level, a.workers)
    img = np.clip(np.round(out), 0, 255).astype(np.uint8)
    if a.debug:
        Image.fromarray(img, "RGBA").save(a.debug)
    Image.fromarray(img, "RGBA").save(a.out, "WEBP", quality=a.quality, alpha_quality=90, method=6)
    print("wrote", a.out, os.path.getsize(a.out), "bytes")


if __name__ == "__main__":
    main()
