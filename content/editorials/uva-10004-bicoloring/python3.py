import sys
from collections import deque
values = iter(map(int, sys.stdin.buffer.read().split()))
for n in values:
    if n == 0:
        break
    graph = [[] for _ in range(n)]
    for _ in range(next(values)):
        a, b = next(values), next(values)
        graph[a].append(b)
        graph[b].append(a)
    color = [-1] * n
    color[0] = 0
    queue = deque([0])
    good = True
    while queue:
        u = queue.popleft()
        for v in graph[u]:
            if color[v] == -1:
                color[v] = 1 - color[u]
                queue.append(v)
            elif color[v] == color[u]:
                good = False
    print('BICOLORABLE.' if good else 'NOT BICOLORABLE.')
