import sys
from collections import deque

def solve(rows, columns, row_sums, column_sums):
    source = rows + columns
    sink = source + 1
    vertices = sink + 1
    capacity = [[0] * vertices for _ in range(vertices)]
    previous = 0
    for i, cumulative in enumerate(row_sums):
        capacity[source][i] = cumulative - previous - columns
        previous = cumulative
        for j in range(columns):
            capacity[i][rows+j] = 19
    previous = 0
    for j, cumulative in enumerate(column_sums):
        capacity[rows+j][sink] = cumulative - previous - rows
        previous = cumulative

    def send(u, amount):
        if u == sink:
            return amount
        while following[u] < vertices:
            v = following[u]
            if capacity[u][v] > 0 and level[v] == level[u] + 1:
                pushed = send(v, min(amount, capacity[u][v]))
                if pushed:
                    capacity[u][v] -= pushed
                    capacity[v][u] += pushed
                    return pushed
            following[u] += 1
        return 0

    while True:
        level = [-1] * vertices
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
        following = [0] * vertices
        while send(source, 8000):
            pass
    return [[20-capacity[i][rows+j] for j in range(columns)] for i in range(rows)]

values = iter(map(int, sys.stdin.buffer.read().split()))
answers = []
for case in range(1, next(values)+1):
    rows, columns = next(values), next(values)
    row_sums = [next(values) for _ in range(rows)]
    column_sums = [next(values) for _ in range(columns)]
    matrix = solve(rows, columns, row_sums, column_sums)
    answers.append('Matrix ' + str(case) + '\n' + '\n'.join(' '.join(map(str, row)) for row in matrix))
print('\n\n'.join(answers))
