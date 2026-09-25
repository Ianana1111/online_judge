import sys
data=list(map(int,sys.stdin.buffer.read().split()))
at=0;out=[]
while at<len(data):
    n,m=data[at:at+2];at+=2
    if n==0 and m==0:break
    edges=[]
    for _ in range(m):
        u,v,w=data[at:at+3];at+=3;edges.append((w,u,v))
    edges.sort();parent=list(range(n));size=[1]*n
    def find(x):
        while parent[x]!=x:
            parent[x]=parent[parent[x]];x=parent[x]
        return x
    heavy=[]
    for w,u,v in edges:
        u=find(u);v=find(v)
        if u==v:heavy.append(str(w))
        else:
            if size[u]<size[v]:u,v=v,u
            parent[v]=u;size[u]+=size[v]
    out.append(' '.join(heavy) if heavy else 'forest')
sys.stdout.write('\n'.join(out))
