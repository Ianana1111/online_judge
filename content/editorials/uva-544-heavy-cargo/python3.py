import sys
data=sys.stdin.buffer.read().split();at=0;out=[]
while at<len(data):
    n=int(data[at]);r=int(data[at+1]);at+=2
    if n==0 and r==0:break
    names={};capacity=[[0]*n for _ in range(n)]
    def index(name):
        if name not in names:names[name]=len(names)
        return names[name]
    for _ in range(r):
        a=index(data[at]);b=index(data[at+1]);w=int(data[at+2]);at+=3
        capacity[a][b]=capacity[b][a]=max(capacity[a][b],w)
    start=index(data[at]);target=index(data[at+1]);at+=2
    best=[0]*n;settled=[False]*n;best[start]=10001
    for _ in range(n):
        u=max((i for i in range(n) if not settled[i]),key=best.__getitem__)
        if best[u]==0:break
        settled[u]=True
        for v in range(n):best[v]=max(best[v],min(best[u],capacity[u][v]))
    out.append(f'Scenario #{len(out)+1}\n{best[target]} tons')
sys.stdout.write('\n\n'.join(out)+'\n\n' if out else '')
