from array import array
import sys

def tokens():
    for line in sys.stdin.buffer:
        yield from map(int, line.split())

def find(parent, x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

values = iter(tokens())
while True:
    n = next(values, None)
    if n is None:
        break
    m = next(values)
    capacity = n + m + 1
    parent = array('i', range(capacity))
    size = array('i', [0]) * capacity
    weight = array('i', [1]) * capacity
    total = array('q', [0]) * capacity
    identity = array('i', range(n + 1))
    for p in range(1, n + 1):
        size[p], total[p] = 1, p
    used = n
    for _ in range(m):
        operation, p = next(values), next(values)
        a = find(parent, identity[p])
        if operation == 3:
            print(size[a], total[a])
            continue
        q = next(values)
        b = find(parent, identity[q])
        if a == b:
            continue
        if operation == 1:
            if weight[a] < weight[b]:
                a, b = b, a
            parent[b] = a
            weight[a] += weight[b]
            size[a] += size[b]
            total[a] += total[b]
        else:
            size[a] -= 1
            total[a] -= p
            size[b] += 1
            total[b] += p
            used += 1
            identity[p] = used
            parent[used] = b
            weight[b] += 1
