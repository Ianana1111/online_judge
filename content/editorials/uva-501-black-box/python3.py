import heapq
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;blocks=[]
for _ in range(data[0]) if data else []:
    m,n=data[at:at+2];at+=2
    values=data[at:at+m];at+=m;queries=data[at:at+n];at+=n
    lower=[];upper=[];inserted=0;out=[]
    for count in queries:
        while inserted<count:
            value=values[inserted];inserted+=1
            if lower and value<-lower[0]:
                heapq.heappush(lower,-value)
                heapq.heappush(upper,-heapq.heappop(lower))
            else:heapq.heappush(upper,value)
        heapq.heappush(lower,-heapq.heappop(upper))
        out.append(str(-lower[0]))
    blocks.append('\n'.join(out))
sys.stdout.write('\n\n'.join(blocks)+'\n' if blocks else '')
