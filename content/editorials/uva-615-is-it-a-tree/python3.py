import sys
data = list(map(int, sys.stdin.buffer.read().split()))
edges = [[] for _ in range(101)]
indegree = [0] * 101
vertices = set()
out = []
case_no = 0
for i in range(0, len(data) - 1, 2):
    u, v = data[i], data[i + 1]
    if u < 0 and v < 0:
        break
    if u == 0 and v == 0:
        case_no += 1
        roots = [x for x in vertices if indegree[x] == 0]
        good = not vertices or (len(roots) == 1 and all(
            indegree[x] == (0 if x == roots[0] else 1) for x in vertices))
        if good and vertices:
            seen = {roots[0]}
            queue = [roots[0]]
            for x in queue:
                for y in edges[x]:
                    if y not in seen:
                        seen.add(y)
                        queue.append(y)
            good = len(seen) == len(vertices)
        line = f'Case {case_no} is ' + ('a tree.' if good else 'not a tree.')
        if good and vertices:
            line += f' Root is {roots[0]}.'
        out.append(line)
        edges = [[] for _ in range(101)]
        indegree = [0] * 101
        vertices = set()
    else:
        edges[u].append(v)
        indegree[v] += 1
        vertices.add(u); vertices.add(v)
sys.stdout.write('\n'.join(out))
