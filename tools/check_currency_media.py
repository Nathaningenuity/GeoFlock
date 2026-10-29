#!/usr/bin/env python3
"""Check every country's currency picture against docs/CURRENCY_MEDIA_SPEC.md.

Loads DRILL_FACTS (geoflock-drills.js), drillimg/index.json and tools/currency_sources.json, and prints one line per
violation. Entries that carry an "exception" in currency_sources.json are listed separately (they are documented in the
spec) and do not count as violations. Exit status 1 when there is any violation.
"""
import json, os, re, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FREE = re.compile(r"^(Public domain|PD\b.*|CC0|CC BY(-SA)? \d\.\d( [A-Za-z]{2,3})?|CC BY(-SA)?( \d\.\d)?|Attribution|Copyrighted free use)$", re.I)
NONFREE = re.compile(r"\bNC\b|non-?commercial|\bND\b|no ?deriv|fair use", re.I)
EURO = {"ad", "at", "be", "bg", "cy", "de", "ee", "es", "fi", "fr", "gr", "hr", "ie", "it", "lt", "lu", "lv", "mc", "mt",
        "nl", "pt", "si", "sk", "sm", "va"}  # euro countries with their own national coin sides (me and xk have none)
BOX = (800, 400)


def facts():
    s = open(os.path.join(ROOT, "geoflock-drills.js"), encoding="utf-8").read()
    i = s.index("const DRILL_FACTS=") + len("const DRILL_FACTS=")
    return json.JSONDecoder().raw_decode(s[i:])[0]


def main():
    F = facts()
    idx = json.load(open(os.path.join(ROOT, "drillimg", "index.json"), encoding="utf-8"))
    src = json.load(open(os.path.join(ROOT, "tools", "currency_sources.json"), encoding="utf-8"))
    bad, exc, ok, checked = [], {}, 0, {}
    for cc in sorted(F):
        v = F[cc]
        errs = []
        if not re.fullmatch(r"[A-Z]{3}", v.get("iso") or ""):
            errs.append("label: no ISO 4217 code")
        if not v.get("cur") or not v.get("sym"):
            errs.append("label: name or symbol missing")
        f = (idx["by"].get(cc) or {}).get("cur")
        if not f:
            errs.append("missing image")
        else:
            if not f.startswith("cur/"):
                errs.append(f"not in drillimg/cur/ ({f})")
            path = os.path.join(ROOT, "drillimg", f)
            if not os.path.exists(path):
                errs.append(f"file missing ({f})")
            else:
                if f not in checked:
                    e2 = []
                    im = Image.open(path)
                    if im.size != BOX:
                        e2.append(f"size {im.size[0]}×{im.size[1]}, not 800×400")
                    if im.mode != "RGBA":
                        e2.append("no alpha channel")
                    else:
                        a = im.getchannel("A")
                        corners = [a.getpixel(p) for p in ((0, 0), (BOX[0] - 1, 0), (0, BOX[1] - 1), (BOX[0] - 1, BOX[1] - 1))]
                        if max(corners) > 8:
                            e2.append("background not transparent")
                        bb = a.point(lambda x: 255 if x > 8 else 0).getbbox()
                        if not bb:
                            e2.append("empty image")
                        else:
                            w, h = bb[2] - bb[0], bb[3] - bb[1]
                            cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
                            if abs(cx - BOX[0] / 2) > 4 or abs(cy - BOX[1] / 2) > 4:
                                e2.append("not centred")
                            kind = (idx["credit"].get(f) or {}).get("kind")
                            if kind == "coin" and not (0.78 * BOX[1] <= h <= 0.86 * BOX[1]):
                                e2.append(f"coin height {h}px, not ~82 % of the box")
                            if kind == "note" and w < 0.9 * BOX[0] and h < 0.9 * BOX[1]:
                                e2.append(f"note does not fill the box ({w}×{h})")
                            if kind == "note" and h > w:
                                e2.append("note is portrait")
                    checked[f] = e2
                errs += checked[f]
            C = idx["credit"].get(f) or {}
            lic = (C.get("lic") or "").strip()
            if not lic:
                errs.append("no licence")
            elif NONFREE.search(lic) or not FREE.match(lic):
                errs.append(f"licence not free: {lic}")
            if not C.get("by"):
                errs.append("no author")
            if not (C.get("page") or "").startswith("https://commons.wikimedia.org/wiki/File:"):
                errs.append("no Commons page")
            if C.get("kind") not in ("note", "coin"):
                errs.append("kind is not note or coin")
            if cc in EURO and C.get("kind") != "coin":
                errs.append("euro country without its national euro coin")
            if cc not in EURO and C.get("kind") == "coin":
                errs.append("a coin, but coins are only for euro national sides")
            if C.get("exception"):
                exc.setdefault(C["exception"], []).append(cc)
        if errs:
            bad += [(cc, e) for e in errs]
        else:
            ok += 1
    for cc, e in bad:
        print(f"VIOLATION {cc}: {e}")
    if exc:
        print("\nDocumented exceptions (see docs/CURRENCY_MEDIA_SPEC.md):")
        for why, ccs in exc.items():
            print(f"  {', '.join(ccs)}: {why}")
    print(f"\n{len(F)} countries, {ok} pass, {len(set(c for c, _ in bad))} with violations ({len(bad)} violations), "
          f"{len(set(checked))} distinct images")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
