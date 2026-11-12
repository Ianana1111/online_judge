import heapq
import sys

values = list(map(int, sys.stdin.buffer.read().split()))
turtles = sorted(zip(values[1::2], values[0::2]))
stack = []
total = 0
for strength, weight in turtles:
    heapq.heappush(stack, -weight)
    total += weight
    if total > strength:
        total += heapq.heappop(stack)
print(len(stack))
