from array import array
from heapq import heappop, heappush
import sys

def tokens():
    for line in sys.stdin.buffer:
        yield from map(int, line.split())

values = iter(tokens())
for _ in range(next(values)):
    rows, columns = next(values), next(values)
    count = rows * columns
    weight = bytearray(next(values) for _ in range(count))
    distance = array('i', [2_000_000_000]) * count
    distance[0] = weight[0]
    queue = [weight[0] * count]
    while queue:
        cost, node = divmod(heappop(queue), count)
        if cost != distance[node]:
            continue
        if node == count - 1:
            break
        row, column = divmod(node, columns)
        for following in (node - columns if row else -1,
                          node + columns if row + 1 < rows else -1,
                          node - 1 if column else -1,
                          node + 1 if column + 1 < columns else -1):
            if following < 0:
                continue
            candidate = cost + weight[following]
            if candidate < distance[following]:
                distance[following] = candidate
                heappush(queue, candidate * count + following)
    print(distance[-1])
