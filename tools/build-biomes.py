# Rebuilds GF_NATURE.biomes in geoflock-nature-data.js by merging the RESOLVE ecoregions (nature/ecoregions.topo.json)
# biome by biome, so no ecoregion is left out (the Ethiopian Highlands were missing). Simplified to about 0.03 degrees.
import json,re
from shapely.geometry import shape,mapping
from shapely.ops import unary_union
t=json.load(open('nature/ecoregions.topo.json'))
tr=t.get('transform');arcs=[]
for a in t['arcs']:
  x=y=0;pts=[]
  for p in a:
    if tr: x+=p[0];y+=p[1];pts.append([x*tr['scale'][0]+tr['translate'][0],y*tr['scale'][1]+tr['translate'][1]])
    else: pts.append(p)
  arcs.append(pts)
def ring(ix):
  out=[]
  for i in ix:
    a=arcs[i] if i>=0 else arcs[~i][::-1]
    out.extend(a if not out else a[1:])
  return out
by={}
for g in t['objects']['eco']['geometries']:
  b=g['properties'].get('b')
  if b is None or 'arcs' not in g: continue
  polys=[g['arcs']] if g['type']=='Polygon' else g['arcs']
  for P in polys:
    rs=[ring(r) for r in P]
    if len(rs[0])<4: continue
    try:
      s=shape({'type':'Polygon','coordinates':rs}).buffer(0)
      by.setdefault(b,[]).append(s)
    except Exception: pass
import sys
src=open(sys.argv[1] if len(sys.argv)>1 else 'geoflock-nature-data.js').read()
i=src.index('window.GF_NATURE=')+len('window.GF_NATURE=')
# find the JSON object of GF_NATURE (to the end of statement)
N=json.loads(src[i:src.rindex(';')]) if src.rstrip().endswith(';') else None
names={f['properties']['b']:f['properties']['n'] for f in N['biomes']['features']}
feats=[]
for b in sorted(by):
  u=unary_union(by[b]).buffer(0.02).buffer(-0.02).simplify(0.06,preserve_topology=True)
  # d3 wants outer rings clockwise (the other way from shapely's), or it fills the rest of the globe
  from shapely.geometry.polygon import orient
  from shapely.geometry import MultiPolygon,Polygon
  ps=[orient(p,-1.0) for p in (u.geoms if hasattr(u,'geoms') else [u]) if isinstance(p,Polygon) and p.area>2e-3]  # slivers left by simplifying read as the whole globe
  m=mapping(MultiPolygon(ps))
  def rnd(c):
    return [rnd(x) for x in c] if isinstance(c[0],(list,tuple)) else [round(c[0],2),round(c[1],2)]
  m={'type':m['type'],'coordinates':rnd(m['coordinates'])}
  # rounding can collapse a small ring: drop rings with fewer than 4 distinct points
  m['coordinates']=[[r for r in P if len({tuple(x) for x in r})>=4] for P in m['coordinates']]
  m['coordinates']=[P for P in m['coordinates'] if P and len({tuple(x) for x in P[0]})>=4]
  feats.append({'type':'Feature','properties':{'b':b,'n':names.get(b,str(b))},'geometry':m})
# biomes with no ecoregion in the file (Rock and Ice) keep their old outlines
have={f['properties']['b'] for f in feats}
feats+= [f for f in N['biomes']['features'] if f['properties']['b'] not in have]
feats.sort(key=lambda f:f['properties']['b'])
N['biomes']={'type':'FeatureCollection','features':feats}
open('geoflock-nature-data.js','w').write(src[:i]+json.dumps(N,separators=(',',':'),ensure_ascii=False)+';\n')
print(len(feats),len(json.dumps(N['biomes'])))
