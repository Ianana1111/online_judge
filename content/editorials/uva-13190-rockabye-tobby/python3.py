import sys
import heapq
tokens=iter(sys.stdin.buffer.read().split())
for _ in range(int(next(tokens))):
    n,k=int(next(tokens)),int(next(tokens))
    names=[]
    heap=[]
    for i in range(n):
        name,period=next(tokens),int(next(tokens))
        names.append(name)
        heapq.heappush(heap,(period,i,period))
    for _ in range(k):
        time,i,period=heapq.heappop(heap)
        sys.stdout.buffer.write(str(time).encode()+b' '+names[i]+b'\n')
        heapq.heappush(heap,(time+period,i,period))
