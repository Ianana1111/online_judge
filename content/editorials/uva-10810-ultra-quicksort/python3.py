import bisect
import sys
from array import array
raw=sys.stdin.buffer.read();at=0;size=len(raw);out=[]
def next_int():
    global at
    while at<size and raw[at]<=32:at+=1
    value=0
    while at<size and raw[at]>32:
        value=value*10+raw[at]-48;at+=1
    return value
while at<size:
    n=next_int()
    if n==0:break
    values=array('i',(next_int() for _ in range(n)))
    sorted_values=sorted(values)
    tree=array('i',[0])*(n+1)
    answer=0
    for i,value in enumerate(values):
        pos=bisect.bisect_left(sorted_values,value)+1
        total=0;query=pos
        while query>0:total+=tree[query];query-=query&-query
        answer+=i-total
        while pos<=n:tree[pos]+=1;pos+=pos&-pos
    out.append(str(answer))
sys.stdout.write('\n'.join(out))
