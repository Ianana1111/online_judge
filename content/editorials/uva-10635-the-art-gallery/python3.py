import bisect
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for tc in range(1,data[0]+1) if data else []:
    n,p,q=data[at:at+3];at+=3
    position=[-1]*(n*n+1)
    for i in range(p+1):position[data[at+i]]=i
    at+=p+1;tails=[]
    for _ in range(q+1):
        value=data[at];at+=1;rank=position[value]
        if rank<0:continue
        where=bisect.bisect_left(tails,rank)
        if where==len(tails):tails.append(rank)
        else:tails[where]=rank
    out.append(f'Case {tc}: {len(tails)}')
sys.stdout.write('\n'.join(out))
