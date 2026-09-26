import re
import sys
from collections import deque

class Dinic:
    def __init__(self, n):
        self.graph = [[] for _ in range(n)]
    def add(self, u, v, capacity):
        a = [v, len(self.graph[v]), capacity]
        b = [u, len(self.graph[u]), 0]
        self.graph[u].append(a)
        self.graph[v].append(b)
    def flow(self, source, sink, limit):
        graph = self.graph
        total = 0
        while total < limit:
            level = [-1]*len(graph)
            level[source] = 0
            queue = deque([source])
            while queue:
                u = queue.popleft()
                for v, reverse, capacity in graph[u]:
                    if capacity and level[v] < 0:
                        level[v] = level[u]+1
                        queue.append(v)
            if level[sink] < 0:
                break
            current = [0]*len(graph)
            def send(u, amount):
                if u == sink:
                    return amount
                while current[u] < len(graph[u]):
                    edge = graph[u][current[u]]
                    v, reverse, capacity = edge
                    if capacity and level[v] == level[u]+1:
                        sent = send(v, min(amount, capacity))
                        if sent:
                            edge[2] -= sent
                            graph[v][reverse][2] += sent
                            return sent
                    current[u] += 1
                return 0
            while total < limit:
                sent = send(source, limit-total)
                if not sent:
                    break
                total += sent
        return total

def solve(adjacent):
    n = len(adjacent)
    if n <= 1 or all(len(row) == n-1 for row in adjacent):
        return n
    answer = min(map(len, adjacent))
    for source in range(n):
        for sink in range(source+1, n):
            if not answer:
                return 0
            if sink in adjacent[source]:
                continue
            network = Dinic(2*n)
            for v in range(n):
                network.add(2*v, 2*v+1, n if v in (source, sink) else 1)
            for u in range(n):
                for v in adjacent[u]:
                    network.add(2*u+1, 2*v, n)
            answer = min(answer, network.flow(2*source+1, 2*sink, answer))
    return answer

values = (int(x) for line in sys.stdin.buffer for x in re.findall(rb'\d+', line))
for n in values:
    m = next(values)
    adjacent = [set() for _ in range(n)]
    for _ in range(m):
        u, v = next(values), next(values)
        adjacent[u].add(v)
        adjacent[v].add(u)
    print(solve(adjacent))
