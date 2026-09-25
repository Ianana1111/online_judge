import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for _ in range(data[0]) if data else []:
    n=data[at];at+=1;head=[-1]*n;to=[];weight=[];next_edge=[]
    for _ in range(n-1):
        u,v,w=data[at:at+3];at+=3;u-=1;v-=1
        to.append(v);weight.append(w);next_edge.append(head[u]);head[u]=len(to)-1
        to.append(u);weight.append(w);next_edge.append(head[v]);head[v]=len(to)-1
    frequency=[0]*n;m=data[at];at+=1
    for _ in range(m):u,f=data[at:at+2];at+=2;frequency[u-1]=f
    parent=[-1]*n;edge=[0]*n;distance=[0]*n;parent[0]=0;order=[0]
    for u in order:
        e=head[u]
        while e>=0:
            v=to[e]
            if v!=parent[u]:parent[v]=u;edge[v]=weight[e];distance[v]=distance[u]+weight[e];order.append(v)
            e=next_edge[e]
    total=sum(frequency);subtree=frequency[:];cost=[0]*n
    cost[0]=sum(frequency[u]*distance[u] for u in range(n))
    for u in reversed(order[1:]):subtree[parent[u]]+=subtree[u]
    for v in order[1:]:cost[v]=cost[parent[v]]+edge[v]*(total-2*subtree[v])
    best=min(cost);out.append(str(2*best))
    out.append(' '.join(str(u+1) for u in range(n) if cost[u]==best))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
