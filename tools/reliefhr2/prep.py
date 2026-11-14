# downsample HR to the globe grid; save current globe as one array
import numpy as np,sys
from PIL import Image;Image.MAX_IMAGE_PIXELS=None
hr,repo,out=sys.argv[1:4]
im=Image.open(hr).convert('RGB')
print(im.size)
lo=im.resize((8192,4096),Image.BOX)
lo.save(out+'/hr_lo.png')
w=Image.open(repo+'/textures/GLOBE_RELIEF_W_LK_NE.webp').convert('RGB');e=Image.open(repo+'/textures/GLOBE_RELIEF_E_LK_NE.webp').convert('RGB')
c=Image.new('RGB',(8192,4096));c.paste(w,(0,0));c.paste(e,(4096,0));c.save(out+'/cur.png')
