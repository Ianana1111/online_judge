import math
import sys
lines=sys.stdin.buffer.read().splitlines();count=int(lines[0]);at=1;out=[]
for _ in range(count):
    while at<len(lines) and not lines[at].strip():at+=1
    at+=1  # Depot coordinates do not affect the total street length.
    distance=0.0
    while at<len(lines) and lines[at].strip():
        x1,y1,x2,y2=map(float,lines[at].split())
        distance+=math.hypot(x2-x1,y2-y1);at+=1
    minutes=math.floor(distance*6/1000+0.5)
    out.append(f'{minutes//60}:{minutes%60:02d}')
sys.stdout.write('\n\n'.join(out)+'\n')
