import sys
import heapq
tokens=iter(sys.stdin.buffer.read().split())
events=[]
for command in tokens:
    if command==b'#':
        break
    identifier,period=int(next(tokens)),int(next(tokens))
    heapq.heappush(events,(period,identifier,period))
for _ in range(int(next(tokens))):
    time,identifier,period=heapq.heappop(events)
    print(identifier)
    heapq.heappush(events,(time+period,identifier,period))
