"""Build textures/SEAS_IHO.json: the seas and oceans as the International Hydrographic Organization bounds them, with
the land of the map's own coastline (Natural Earth 1:10m land and minor islands) taken out, so a sea's fill stops at
the map's coast.

Sources
  - Flanders Marine Institute (2018). IHO Sea Areas, version 3. marineregions.org, https://doi.org/10.14284/323 (CC BY 4.0).
    Fetched from geo.vliz.be/geoserver/MarineRegions/wfs (typeName MarineRegions:iho, outputFormat application/json).
  - Natural Earth 1:10m land and minor islands (public domain), naturalearthdata.com.

Usage: python3 build_seas.py iho.json ne_10m_land.shp ne_10m_minor_islands.shp ne_10m_antarctic_ice_shelves_polys.shp out.json
Antarctica's ice shelves are taken out too, and the South Atlantic, Indian and South Pacific Oceans stop where the
Southern Ocean begins (the IHO's 1953 limits ran them to Antarctica; the app shows the Southern Ocean on its own).
Each sea is keyed by the name the app uses for it. A few app seas take in IHO areas the app has no name of its own for
(the Mediterranean takes in its western and eastern basins and the Alboran and Ligurian Seas; the Baltic the Gulf of Riga;
the Red Sea the Gulf of Aqaba; Skagerrak and Kattegat both). IHO areas with no app name are kept under their own names
(hover only). Rings are wound for d3 (outer rings clockwise, holes anticlockwise, in longitude/latitude)."""
import json, sys
import shapefile
from shapely.geometry import shape, mapping, MultiPolygon, Polygon, box
from shapely.ops import unary_union
from shapely.strtree import STRtree
from shapely.geometry.polygon import orient

RENAME = {
 "Balearic (Iberian Sea)": "Balearic Sea", "Barentsz Sea": "Barents Sea", "Japan Sea": "Sea of Japan",
 "Eastern China Sea": "East China Sea", "Andaman or Burma Sea": "Andaman Sea", "Molukka Sea": "Molucca Sea",
 "Gulf of St. Lawrence": "Gulf of Saint Lawrence", "Irish Sea and St. George's Channel": "Irish Sea",
 "Malacca Strait": "Strait of Malacca", "Singapore Strait": "Strait of Singapore", "Rio de La Plata": "Río de la Plata",
 "Inner Seas off the West Coast of Scotland": "Inner Seas (Scotland)", "Seto Naikai or Inland Sea": "Seto Inland Sea",
 "The Northwestern Passages": "Northwest Passage", "Skagerrak": "Skagerrak and Kattegat", "Kattegat": "Skagerrak and Kattegat",
 "Mediterranean Sea - Western Basin": "Mediterranean Sea", "Mediterranean Sea - Eastern Basin": "Mediterranean Sea",
}
# IHO areas that are also folded into a bigger app sea (they keep their own entry too, for hover)
ALSO = {"Alboran Sea": "Mediterranean Sea", "Ligurian Sea": "Mediterranean Sea", "Gulf of Riga": "Baltic Sea", "Gulf of Aqaba": "Red Sea"}
SKIP = {"The Coastal Waters of Southeast Alaska and British Columbia"}
TOL = 0.04
MIN_HOLE = 0.02  # square degrees: smaller islands are not cut out of the sea (about 15 km across)

def land_shapes(*paths):
    out = []
    for p in paths:
        r = shapefile.Reader(p)
        for s in r.shapes():
            g = shape(s.__geo_interface__)
            if not g.is_valid: g = g.buffer(0)
            out.extend(list(g.geoms) if hasattr(g, "geoms") else [g])
    return out

def main(iho, landp, minorp, icep, outp):
    land = land_shapes(landp, minorp, icep)
    tree = STRtree(land)
    F = json.load(open(iho))["features"]
    groups = {}
    for f in F:
        n = f["properties"]["name"]
        if n in SKIP: continue
        g = shape(f["geometry"])
        if not g.is_valid: g = g.buffer(0)
        for key in {RENAME.get(n, n)} | ({ALSO[n]} if n in ALSO else set()):
            groups.setdefault(key, []).append(g)
    south = unary_union(groups["Southern Ocean"])
    res = {}
    for key, gs in groups.items():
        g = unary_union(gs) if len(gs) > 1 else gs[0]
        if key in ("South Atlantic Ocean", "Indian Ocean", "South Pacific Ocean"):
            g = g.difference(south)
        hits = [land[i] for i in tree.query(g)]
        if hits:
            g = g.difference(unary_union(hits))
        g = g.simplify(TOL, preserve_topology=True)
        polys = [p for p in (g.geoms if hasattr(g, "geoms") else [g]) if isinstance(p, Polygon) and p.area > 0.005]
        # a sea reaching right round the world (the Southern Ocean) is cut into four by longitude: d3 reads a ring that
        # runs all the way round, split at 180 degrees, as the wrong side of itself
        cut = []
        for p in polys:
            if p.bounds[2] - p.bounds[0] > 180:
                for x0 in (-180, -90, 0, 90):
                    q = p.intersection(box(x0, -90, x0 + 90, 90))
                    cut.extend(x for x in (q.geoms if hasattr(q, "geoms") else [q]) if isinstance(x, Polygon) and x.area > 0.005)
            else:
                cut.append(p)
        polys = cut
        if not polys: continue
        co = []
        for p in polys:
            p = orient(p, sign=-1.0)
            holes = [r for r in p.interiors if Polygon(r).area >= MIN_HOLE]
            co.append([[[round(x, 2), round(y, 2)] for x, y in r.coords] for r in [p.exterior] + holes])
        res[key] = co
        print(key, len(co), sum(len(r) for P in co for r in P), file=sys.stderr)
    json.dump({"source": "Flanders Marine Institute (2018), IHO Sea Areas v3, marineregions.org (CC BY 4.0); land: Natural Earth 1:10m",
               "seas": res}, open(outp, "w"), separators=(",", ":"), ensure_ascii=False)

if __name__ == "__main__":
    main(*sys.argv[1:6])
