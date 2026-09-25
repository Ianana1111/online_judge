import math
import sys
data=sys.stdin.buffer.read().split();out=[]
for i in range(0,len(data),3):
    height=int(data[i]);angle=int(data[i+1]);unit=data[i+2]
    degrees=angle/60 if unit==b'min' else angle
    degrees=degrees%360
    if degrees>180:degrees=360-degrees
    radius=6440+height;theta=math.radians(degrees)
    out.append(f'{radius*theta:.6f} {2*radius*math.sin(theta/2):.6f}')
sys.stdout.write('\n'.join(out))
