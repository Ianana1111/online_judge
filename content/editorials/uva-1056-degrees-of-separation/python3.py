import sys
tokens=iter(sys.stdin.buffer.read().split())
out=[];case=0
for first in tokens:
    n=int(first);r=int(next(tokens))
    if n==0 and r==0:break
    case+=1;names={};inf=1000000
    dist=[[0 if i==j else inf for j in range(n)] for i in range(n)]
    for _ in range(r):
        a=next(tokens);b=next(tokens)
        if a not in names:names[a]=len(names)
        if b not in names:names[b]=len(names)
        u=names[a];v=names[b];dist[u][v]=dist[v][u]=1
    for k in range(n):
        for i in range(n):
            through=dist[i][k]
            for j in range(n):
                candidate=through+dist[k][j]
                if candidate<dist[i][j]:dist[i][j]=candidate
    answer=max(map(max,dist))
    out.append(f'Network {case}: {"DISCONNECTED" if answer==inf else answer}')
sys.stdout.write('\n\n'.join(out)+'\n\n' if out else '')
