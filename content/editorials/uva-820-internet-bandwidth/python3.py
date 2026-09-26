from collections import deque
import sys

def numbers():
    for line in sys.stdin.buffer:
        yield from map(int, line.split())

values = iter(numbers())
case = 0
while True:
    n = next(values, 0)
    if n == 0:
        break
    source, sink, edges = next(values) - 1, next(values) - 1, next(values)
    capacity = [[0] * n for _ in range(n)]
    for _ in range(edges):
        a, b, amount = next(values) - 1, next(values) - 1, next(values)
        capacity[a][b] += amount
        capacity[b][a] += amount

    def send(u, available):
        if u == sink:
            return available
        while following[u] < n:
            v = following[u]
            if capacity[u][v] > 0 and level[v] == level[u] + 1:
                pushed = send(v, min(available, capacity[u][v]))
                if pushed:
                    capacity[u][v] -= pushed
                    capacity[v][u] += pushed
                    return pushed
            following[u] += 1
        return 0

    total = 0
    while True:
        level = [-1] * n
        level[source] = 0
        queue = deque([source])
        while queue:
            u = queue.popleft()
            for v, amount in enumerate(capacity[u]):
                if amount > 0 and level[v] < 0:
                    level[v] = level[u] + 1
                    queue.append(v)
        if level[sink] < 0:
            break
        following = [0] * n
        while True:
            pushed = send(source, 10**18)
            if not pushed:
                break
            total += pushed
    case += 1
    print(f"Network {case}\nThe bandwidth is {total}.\n")
