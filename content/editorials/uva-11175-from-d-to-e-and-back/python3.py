import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for tc in range(1,data[0]+1) if data else []:
    n,k=data[at:at+2];at+=2;rows=[0]*n
    for _ in range(k):
        u,v=data[at:at+2];at+=2;rows[u]|=1<<v
    valid=True
    for u in range(n):
        for v in range(u+1,n):
            if rows[u]&rows[v] and rows[u]!=rows[v]:valid=False;break
        if not valid:break
    out.append(f'Case #{tc}: {"Yes" if valid else "No"}')
sys.stdout.write('\n'.join(out))
