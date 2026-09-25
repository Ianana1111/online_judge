import heapq
import sys
lower = []
upper = []
out = []
for token in sys.stdin.buffer.read().split():
    value = int(token)
    if not lower or value <= -lower[0]:
        heapq.heappush(lower, -value)
    else:
        heapq.heappush(upper, value)
    if len(lower) > len(upper) + 1:
        heapq.heappush(upper, -heapq.heappop(lower))
    elif len(upper) > len(lower):
        heapq.heappush(lower, -heapq.heappop(upper))
    out.append(str((-lower[0] + upper[0]) // 2 if len(lower) == len(upper) else -lower[0]))
sys.stdout.write('\n'.join(out))
