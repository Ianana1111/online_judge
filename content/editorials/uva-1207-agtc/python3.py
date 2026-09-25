import sys
data=iter(sys.stdin.buffer.read().split());out=[]
for token in data:
    m=int(token);x=next(data) if m else b''
    n=int(next(data));y=next(data) if n else b''
    previous=list(range(n+1))
    for i,ch in enumerate(x,1):
        current=[i]+[0]*n
        for j,target in enumerate(y,1):
            current[j]=min(previous[j]+1,current[j-1]+1,previous[j-1]+(ch!=target))
        previous=current
    out.append(str(previous[n]))
sys.stdout.write('\n'.join(out))
