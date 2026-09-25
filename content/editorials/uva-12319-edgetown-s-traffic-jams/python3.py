import sys
lines=sys.stdin.buffer.read().splitlines();at=0;out=[];INF=100000000
while at<len(lines):
    if not lines[at].strip():at+=1;continue
    n=int(lines[at]);at+=1
    if n==0:break
    def read_graph():
        global at
        graph=[[0 if u==v else INF for v in range(n)] for u in range(n)]
        for _ in range(n):
            while not lines[at].strip():at+=1
            row=list(map(int,lines[at].split()));at+=1;u=row[0]-1
            for raw in row[1:]:graph[u][raw-1]=1
        for k in range(n):
            via=graph[k]
            for u in range(n):
                row=graph[u];prefix=row[k]
                for v in range(n):
                    route=prefix+via[v]
                    if route<row[v]:row[v]=route
        return graph
    old=read_graph();proposal=read_graph()
    while not lines[at].strip():at+=1
    a,b=map(int,lines[at].split());at+=1
    diameter=max(max(row) for row in old)
    valid=all(proposal[u][v]!=INF and proposal[u][v]<=a*old[u][v]+b for u in range(n) for v in range(n))
    out.append(f'{"Yes" if valid else "No"} {diameter}')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
