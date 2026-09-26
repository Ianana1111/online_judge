from array import array
from collections import deque
import sys

def numbers():
    for line in sys.stdin.buffer:
        yield from map(int, line.split())

values = iter(numbers())
case = 0
while True:
    n, m = next(values, 0), next(values, 0)
    if n == m == 0:
        break
    head = array('i', [-1]) * n
    to, following, capacity = array('i'), array('i'), bytearray()
    for _ in range(m):
        a, b = next(values) - 1, next(values) - 1
        to.append(b); following.append(head[a]); capacity.append(1); head[a] = len(to) - 1
        to.append(a); following.append(head[b]); capacity.append(1); head[b] = len(to) - 1
    source, target = next(values) - 1, next(values) - 1
    flow = 0
    for _ in range(2):
        parent = array('i', [-1]) * n
        parent[source] = -2
        queue = deque([source])
        while queue and parent[target] < 0:
            u = queue.popleft()
            edge = head[u]
            while edge >= 0:
                v = to[edge]
                if capacity[edge] and parent[v] == -1:
                    parent[v] = edge
                    queue.append(v)
                edge = following[edge]
        if parent[target] < 0:
            break
        v = target
        while v != source:
            edge = parent[v]
            capacity[edge] -= 1
            capacity[edge ^ 1] += 1
            v = to[edge ^ 1]
        flow += 1
    case += 1
    print(f"Case {case}: {'YES' if flow == 2 else 'NO'}")
