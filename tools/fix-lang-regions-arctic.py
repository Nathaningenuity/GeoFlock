"""Restore Sakha and Komi in textures/LANG_REGIONS.json from provinces/ru.json (Natural Earth admin-1): the build had cut
the band from about 65 to 69 deg N out of both (a gap in the outline they were trimmed to)."""
import json
from shapely.geometry import shape
R='/home/user/geoflock/'
f=R+'textures/LANG_REGIONS.json';t=json.load(open(f));tr=t.get('transform')
prov={x['n']:x['g'] for x in json.load(open(R+'provinces/ru.json'))['items']}
def q(pt):
  if not tr:return [round(pt[0],4),round(pt[1],4)]
  return [round((pt[0]-tr['translate'][0])/tr['scale'][0]),round((pt[1]-tr['translate'][1])/tr['scale'][1])]
def enc(coords):
  qs=[q(p) for p in coords]
  if not tr:return qs
  out=[];px=py=0;last=None
  for x,y in qs:
    if last==(x,y):continue
    out.append([x-px,y-py]);px,py=x,y;last=(x,y)
  return out
def add(ring):
  t['arcs'].append(enc(list(ring.coords)));return [len(t['arcs'])-1]
n=0
for g in t['objects']['r']['geometries']:
  k=g['properties'].get('k','')
  if k not in ('ru:Sakha Republic','ru:Komi Republic'):continue
  sh=shape(prov[k[3:]]).buffer(0).simplify(0.02,preserve_topology=True)
  polys=[sh] if sh.geom_type=='Polygon' else list(sh.geoms)
  polys=[p for p in polys if p.area>0.02]
  g['type']='MultiPolygon';g['arcs']=[[add(p.exterior)]+[add(h) for h in p.interiors] for p in polys];n+=1
json.dump(t,open(f,'w'),separators=(',',':'))
print('replaced',n)
