import sys
data=sys.stdin.buffer.read().split();out=[]
def possible(y,x,bound):
    m=len(y);previous=list(range(m+1));current=[0]*(m+1);finished=False
    for ch in x:
        current[0]=previous[0]+1
        for j in range(1,m+1):
            a=previous[j]+1;b=current[j-1]+1;c=previous[j-1]+(ch!=y[j-1])
            small=a if a<b else b;current[j]=small if small<c else c
        finished=current[m]<=bound
        if finished:
            for j in range(m+1):
                if j<current[j]:current[j]=j
        previous,current=current,previous
    return finished
for t in range(int(data[0])) if data else []:
    y,x=data[1+2*t:3+2*t];low=0;high=len(y)
    while low<high:
        mid=(low+high)//2
        if possible(y,x,mid):high=mid
        else:low=mid+1
    out.append(str(low))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
