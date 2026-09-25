import bisect
from array import array
import heapq
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n,target=data[at:at+2];at+=2;values=data[at:at+n];at+=n
    compact=array('q',[0])
    for value in values[:n//2]:
        size=len(compact)
        compact.extend(compact[j]+value for j in range(size))
    chunks=[]
    for begin in range(0,len(compact),50000):
        chunks.append(array('q',sorted(compact[begin:begin+50000])))
    del compact
    left=array('q',heapq.merge(*chunks))
    del chunks
    right=values[n//2:];current=0;previous=0;answer=0
    for mask in range(1<<len(right)):
        gray=mask^(mask>>1)
        if mask:
            changed=gray^previous;index=changed.bit_length()-1
            current+=right[index] if gray&changed else -right[index]
        wanted=target-current
        answer+=bisect.bisect_right(left,wanted)-bisect.bisect_left(left,wanted)
        previous=gray
    if target==0:answer-=1
    out.append(str(answer))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
