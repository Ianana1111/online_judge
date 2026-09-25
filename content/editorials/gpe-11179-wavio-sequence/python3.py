import bisect
import sys
data=list(map(int,sys.stdin.buffer.read().split()))
i=0;out=[]
def ending(values):
    tails=[];length=[]
    for value in values:
        at=bisect.bisect_left(tails,value)
        if at==len(tails):tails.append(value)
        else:tails[at]=value
        length.append(at+1)
    return length
while i<len(data):
    n=data[i];i+=1
    values=data[i:i+n];i+=n
    left=ending(values)
    right=ending(values[::-1])[::-1]
    out.append(str(max(2*min(a,b)-1 for a,b in zip(left,right))))
sys.stdout.write('\n'.join(out))
