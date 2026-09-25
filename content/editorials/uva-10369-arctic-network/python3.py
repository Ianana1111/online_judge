import math
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for _ in range(data[0]) if data else []:
    satellites,n=data[at:at+2];at+=2
    points=[tuple(data[at+2*i:at+2*i+2]) for i in range(n)];at+=2*n
    edges=[]
    for i in range(n):
        for j in range(i+1,n):
            dx=points[i][0]-points[j][0];dy=points[i][1]-points[j][1]
            edges.append((dx*dx+dy*dy,i,j))
    edges.sort();parent=list(range(n));size=[1]*n
    def find(a):
        while parent[a]!=a:parent[a]=parent[parent[a]];a=parent[a]
        return a
    chosen=0;answer=0
    for square,a,b in edges:
        a=find(a);b=find(b)
        if a==b:continue
        if size[a]<size[b]:a,b=b,a
        parent[b]=a;size[a]+=size[b];answer=square;chosen+=1
        if chosen==n-satellites:break
    out.append(f'{math.sqrt(answer):.2f}')
sys.stdout.write('\n'.join(out))
