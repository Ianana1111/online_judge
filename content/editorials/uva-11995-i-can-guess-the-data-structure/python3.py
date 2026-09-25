import heapq
import sys
data = list(map(int, sys.stdin.buffer.read().split()))
i = 0
out = []
while i < len(data):
    n = data[i]; i += 1
    stack, queue, heap = [], [], []
    front = 0
    stack_ok = queue_ok = heap_ok = True
    for _ in range(n):
        op, x = data[i], data[i + 1]
        i += 2
        if op == 1:
            stack.append(x)
            queue.append(x)
            heapq.heappush(heap, -x)
        else:
            if not stack or stack[-1] != x:
                stack_ok = False
            if front == len(queue) or queue[front] != x:
                queue_ok = False
            if not heap or -heap[0] != x:
                heap_ok = False
            if stack:
                stack.pop()
            if front < len(queue):
                front += 1
            if heap:
                heapq.heappop(heap)
    matches = stack_ok + queue_ok + heap_ok
    out.append('impossible' if matches == 0 else 'not sure' if matches > 1 else
               'stack' if stack_ok else 'queue' if queue_ok else 'priority queue')
sys.stdout.write('\n'.join(out))
