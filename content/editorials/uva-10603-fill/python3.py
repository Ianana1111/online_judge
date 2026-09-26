from heapq import heappop, heappush
import sys

def tokens():
    for line in sys.stdin.buffer:
        yield from map(int, line.split())

values = iter(tokens())
for _ in range(next(values)):
    capacity = [next(values) for _ in range(3)]
    target = next(values)
    width = capacity[1] + 1
    count = (capacity[0] + 1) * width
    distance = [10**9] * count
    best = [10**9] * 201
    distance[0] = 0
    queue = [0]
    while queue:
        cost, node = divmod(heappop(queue), count)
        if cost != distance[node]:
            continue
        a, b = divmod(node, width)
        water = [a, b, capacity[2] - a - b]
        for volume in water:
            best[volume] = min(best[volume], cost)
        for source in range(3):
            for destination in range(3):
                if source == destination:
                    continue
                moved = min(water[source], capacity[destination] - water[destination])
                if moved == 0:
                    continue
                following = water.copy()
                following[source] -= moved
                following[destination] += moved
                identifier = following[0] * width + following[1]
                candidate = cost + moved
                if candidate < distance[identifier]:
                    distance[identifier] = candidate
                    heappush(queue, candidate * count + identifier)
    for volume in range(target, -1, -1):
        if best[volume] < 10**9:
            print(best[volume], volume)
            break
