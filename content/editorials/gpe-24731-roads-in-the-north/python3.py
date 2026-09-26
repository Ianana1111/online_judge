import sys

def farthest(graph, start):
    pending = [(start, None, 0)]
    best = (start, 0)
    while pending:
        u, parent, distance = pending.pop()
        if distance > best[1]:
            best = (u, distance)
        for v, length in graph[u]:
            if v != parent:
                pending.append((v, u, distance+length))
    return best

def solve(graph):
    if graph:
        endpoint, _ = farthest(graph, next(iter(graph)))
        print(farthest(graph, endpoint)[1])

graph = {}
for line in sys.stdin.buffer:
    if not line.strip():
        solve(graph)
        graph = {}
        continue
    a, b, length = map(int, line.split())
    graph.setdefault(a, []).append((b, length))
    graph.setdefault(b, []).append((a, length))
solve(graph)
