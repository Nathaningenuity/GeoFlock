#!/usr/bin/env python3
"""GeoFlock currency pictures: fetch, normalise and register every currency image.

tools/currency_sources.json is the single source of truth. Each entry is one picture:
    "<key>": {"file": "<Wikimedia Commons file title>", "kind": "note"|"coin",
              "countries": ["cu"], "what": "Front of the 100-peso note (2021)",
              "shared": "Shared currency, issued by the BCEAO" (optional),
              "rotate": 90 | -90 | 180 (optional, degrees counter-clockwise, applied after trimming),
              "crop": [left, top, right, bottom] (optional, fractions of the source, applied first),
              "by": "...", "lic": "...", "page": "https://commons.wikimedia.org/wiki/File:...",
              "exception": "why this one departs from the spec" (optional)}

For each entry the script
  1. downloads a 1280 px thumbnail (a standard Wikimedia size) from upload.wikimedia.org (cached in ~/.cache/geoflock-cur, gently: one
     request every 5 s, exponential back-off on HTTP 429),
  2. trims scanner borders and plain background,
  3. turns a portrait note to landscape,
  4. fits it, without cropping or stretching, centred in an 800×400 transparent box (notes fill the box less a 2 %
     margin; coins are cut out round and drawn at 82 % of the box height),
  5. writes drillimg/cur/<key>.webp (quality 82) and points drillimg/index.json "by"[cc]["cur"] and "credit" at it.

Run:  python3 tools/currency_media.py            (all entries)
      python3 tools/currency_media.py cu xof     (some entries)
Then: python3 tools/check_currency_media.py
"""
import hashlib, io, json, os, re, sys, time, urllib.parse, urllib.request
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "currency_sources.json")
OUT = os.path.join(ROOT, "drillimg", "cur")
INDEX = os.path.join(ROOT, "drillimg", "index.json")
CACHE = os.environ.get("GF_CUR_CACHE", os.path.expanduser("~/.cache/geoflock-cur"))
UA = "GeoFlockEdu/1.0 (https://github.com/Nathaningenuity/GeoFlock)"
BOX = (800, 400)
NOTE_MARGIN = 0.02
COIN_H = 0.82
_last = [0.0]


def commons_thumb(title, width=1280):
    """upload.wikimedia.org thumbnail URL for a Commons file title"""
    name = title.replace(" ", "_")
    h = hashlib.md5(name.encode("utf-8")).hexdigest()
    q = urllib.parse.quote(name)
    ext = name.rsplit(".", 1)[-1].lower()
    suffix = ".png" if ext in ("svg", "tif", "tiff") else ""
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{width}px-{q}{suffix}"


def commons_orig(title):
    name = title.replace(" ", "_")
    h = hashlib.md5(name.encode("utf-8")).hexdigest()
    return f"https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{urllib.parse.quote(name)}"


def fetch(url):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, hashlib.md5(url.encode()).hexdigest())
    if os.path.exists(path):
        return open(path, "rb").read()
    back = 60
    for _ in range(8):
        wait = 5 - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=90).read()
            open(path, "wb").write(data)
            return data
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if e.code in (400, 429) or e.code >= 500:
                if e.code == 400:  # a thumbnail wider than the original: fall back to the original
                    return None
                print(f"   HTTP {e.code}, waiting {back} s", file=sys.stderr)
                time.sleep(back)
                back = min(back * 2, 600)
                continue
            raise
        except OSError as e:
            print(f"   {e}, waiting {back} s", file=sys.stderr)
            time.sleep(back)
            back = min(back * 2, 600)
    raise RuntimeError("could not fetch " + url)


def source_image(e):
    for url in (commons_thumb(e["file"], e.get("width", 1280)), commons_orig(e["file"])):
        data = fetch(url)
        if data:
            im = Image.open(io.BytesIO(data))
            im.load()
            return ImageOps.exif_transpose(im)
    raise RuntimeError("no image for " + e["file"])


def _bg_colour(im):
    """the colour of the outermost ring of pixels (median per channel)"""
    w, h = im.size
    px = []
    for x in range(0, w, max(1, w // 200)):
        px += [im.getpixel((x, 0)), im.getpixel((x, h - 1))]
    for y in range(0, h, max(1, h // 200)):
        px += [im.getpixel((0, y)), im.getpixel((w - 1, y))]
    return tuple(sorted(c[i] for c in px)[len(px) // 2] for i in range(3))


def trim(im, tol=34, passes=3):
    """cut away borders and plain background: rows and columns that are all (near) the edge colour or transparent"""
    im = im.convert("RGBA")
    for _ in range(passes):
        rgb = im.convert("RGB")
        bg = Image.new("RGB", im.size, _bg_colour(rgb))
        diff = ImageChops.difference(rgb, bg).convert("L").point(lambda v: 255 if v > tol else 0)
        alpha = im.getchannel("A").point(lambda v: 255 if v > 24 else 0)
        mask = ImageChops.multiply(diff, alpha)
        # ignore specks, dust and jpeg noise
        mask = mask.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
        box = mask.getbbox()
        if not box or box == (0, 0) + im.size:
            break
        if (box[2] - box[0]) * (box[3] - box[1]) < 0.2 * im.size[0] * im.size[1]:
            break  # would remove most of the picture: the "background" is the subject
        im = im.crop(box)
    return im


def round_cutout(im):
    """a coin: everything outside the inscribed circle becomes transparent"""
    w, h = im.size
    s = 4
    m = Image.new("L", (w * s, h * s), 0)
    ImageDraw.Draw(m).ellipse((0, 0, w * s - 1, h * s - 1), fill=255)
    m = m.resize((w, h), Image.LANCZOS)
    im = im.convert("RGBA")
    im.putalpha(ImageChops.multiply(im.getchannel("A"), m))
    return im


def normalise(im, e):
    if e.get("crop"):
        l, t, r, b = e["crop"]
        W, H = im.size
        im = im.crop((round(l * W), round(t * H), round(r * W), round(b * H)))
    im = trim(im, e.get("tol", 34)) if not e.get("notrim") else im.convert("RGBA")
    if e.get("rotate"):
        im = im.rotate(e["rotate"], expand=True)
    canvas = Image.new("RGBA", BOX, (0, 0, 0, 0))
    if e["kind"] == "coin":
        side = min(im.size)
        im = im.crop(((im.width - side) // 2, (im.height - side) // 2, (im.width + side) // 2, (im.height + side) // 2))
        im = round_cutout(im)
        d = round(BOX[1] * COIN_H)
        im = im.resize((d, d), Image.LANCZOS)
    else:
        if im.height > im.width:
            im = im.rotate(90, expand=True)  # portrait note to landscape (set "rotate" to choose the direction)
        bw, bh = BOX[0] * (1 - 2 * NOTE_MARGIN), BOX[1] * (1 - 2 * NOTE_MARGIN)
        k = min(bw / im.width, bh / im.height)
        im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    canvas.alpha_composite(im, ((BOX[0] - im.width) // 2, (BOX[1] - im.height) // 2))
    return canvas


def main(keys):
    src = json.load(open(SRC, encoding="utf-8"))
    idx = json.load(open(INDEX, encoding="utf-8"))
    os.makedirs(OUT, exist_ok=True)
    for key, e in src.items():
        if key.startswith("_") or (keys and key not in keys):
            continue
        rel = f"cur/{key}.webp"
        print(f"{key:8} {e['file']}")
        out = normalise(source_image(e), e)
        out.save(os.path.join(OUT, f"{key}.webp"), "WEBP", quality=82, method=6)
        idx["credit"][rel] = {k: e[k] for k in ("file", "by", "lic", "page", "kind", "what", "shared", "exception") if e.get(k)}
        idx["credit"][rel]["title"] = idx["credit"][rel].pop("file")
        for cc in e["countries"]:
            idx["by"].setdefault(cc, {})["cur"] = rel
    # drop credits of currency pictures nothing points at any more
    used = {f for v in idx["by"].values() for f in v.values()} | {f for v in idx.get("lib", {}).values() for f in v.values()}
    for f in [f for f in idx["credit"] if f.startswith("cur/") and f not in used]:
        del idx["credit"][f]
    json.dump(idx, open(INDEX, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("index:", INDEX)


if __name__ == "__main__":
    main(set(sys.argv[1:]))
