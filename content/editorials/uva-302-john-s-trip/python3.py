import sys
values = iter(map(int, sys.stdin.buffer.read().split()))
answers = []
for x in values:
    y = next(values)
    if x == y == 0:
        break
    start = min(x, y)
    graph = [[] for _ in range(45)]
    count = 0
    while True:
        road = next(values)
        graph[x].append((road, y))
        graph[y].append((road, x))
        count += 1
        x, y = next(values), next(values)
        if x == y == 0:
            break
    if any(len(neighbors) % 2 for neighbors in graph):
        answers.append('Round trip does not exist.')
        continue
    for neighbors in graph:
        neighbors.sort()
    following = [0] * 45
    used = set()
    vertices = [start]
    edge_stack = []
    route = []
    while vertices:
        u = vertices[-1]
        while following[u] < len(graph[u]) and graph[u][following[u]][0] in used:
            following[u] += 1
        if following[u] == len(graph[u]):
            vertices.pop()
            if edge_stack:
                route.append(edge_stack.pop())
        else:
            road, v = graph[u][following[u]]
            following[u] += 1
            used.add(road)
            vertices.append(v)
            edge_stack.append(road)
    answers.append(' '.join(map(str, reversed(route))) if len(route) == count
                   else 'Round trip does not exist.')
if answers:
    sys.stdout.write('\n\n'.join(answers) + '\n\n')
