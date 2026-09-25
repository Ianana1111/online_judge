import collections
import heapq
import sys
data=list(map(int,sys.stdin.buffer.read().split()));events=[]
for at in range(0,len(data),3):
    left,height,right=data[at:at+3]
    events.append((left,height,1));events.append((right,height,-1))
events.sort();active=collections.Counter();heap=[];out=[];previous=0;at=0
while at<len(events):
    x=events[at][0]
    while at<len(events) and events[at][0]==x:
        _,height,delta=events[at]
        active[height]+=delta
        if delta>0:heapq.heappush(heap,-height)
        at+=1
    while heap and active[-heap[0]]==0:heapq.heappop(heap)
    current=-heap[0] if heap else 0
    if current!=previous:out.extend((str(x),str(current)));previous=current
sys.stdout.write(' '.join(out)+'\n')
