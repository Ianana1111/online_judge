import math
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n=data[at];at+=1
    if n==0:break
    points=[tuple(data[at+2*i:at+2*i+2]) for i in range(n)];at+=2*n
    best=[10**30]*n;used=[False]*n;best[0]=0
    for _ in range(n):
        u=min((i for i in range(n) if not used[i]),key=best.__getitem__)
        used[u]=True
        if u==1:break
        for v in range(n):
            if used[v]:continue
            dx=points[u][0]-points[v][0];dy=points[u][1]-points[v][1]
            best[v]=min(best[v],max(best[u],dx*dx+dy*dy))
    out.append(f'Scenario #{len(out)+1}\nFrog Distance = {math.sqrt(best[1]):.3f}')
sys.stdout.write('\n\n'.join(out)+'\n\n' if out else '')
