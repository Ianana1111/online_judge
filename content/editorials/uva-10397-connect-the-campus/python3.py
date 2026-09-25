import math
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n=data[at];at+=1
    points=[tuple(data[at+2*i:at+2*i+2]) for i in range(n)];at+=2*n
    connected=[bytearray(n) for _ in range(n)]
    m=data[at];at+=1
    for _ in range(m):
        a,b=data[at:at+2];at+=2;a-=1;b-=1
        connected[a][b]=connected[b][a]=1
    best=[10**30]*n;used=bytearray(n);best[0]=0;total=0.0
    for _ in range(n):
        u=min((i for i in range(n) if not used[i]),key=best.__getitem__)
        used[u]=1;total+=math.sqrt(best[u])
        for v in range(n):
            if used[v]:continue
            dx=points[u][0]-points[v][0];dy=points[u][1]-points[v][1]
            weight=0 if connected[u][v] else dx*dx+dy*dy
            if weight<best[v]:best[v]=weight
    out.append(f'{total:.2f}')
sys.stdout.write('\n'.join(out))
