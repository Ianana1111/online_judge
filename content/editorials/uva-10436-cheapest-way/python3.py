import sys

tokens = sys.stdin.read().split()
pos = 0


def take():
    global pos
    pos += 1
    return tokens[pos - 1]


INF = float("inf")
blocks = []
for number in range(1, int(take()) + 1):
    n = int(take())
    names, fee, station = [], [], {}
    for i in range(n):
        name = take()
        names.append(name)
        fee.append(int(take()))
        station[name] = i
    road = [[INF] * n for _ in range(n)]
    for _ in range(int(take())):
        u, v, km = station[take()], station[take()], int(take())
        if km < road[u][v]:
            road[u][v] = road[v][u] = km
    lines = [f"Map #{number}"]
    for q in range(1, int(take()) + 1):
        src, dst, passengers = station[take()], station[take()], int(take())
        cost = [INF] * n
        prev = [-1] * n
        done = [False] * n
        cost[src] = fee[src]
        for _ in range(n):
            x = -1
            for i in range(n):
                if not done[i] and cost[i] < INF and (x < 0 or cost[i] < cost[x]):
                    x = i
            if x < 0:
                break
            done[x] = True
            for y in range(n):
                if road[x][y] < INF and cost[x] + 2 * road[x][y] + fee[y] < cost[y]:
                    cost[y] = cost[x] + 2 * road[x][y] + fee[y]
                    prev[y] = x
        path = []
        x = dst
        while x != -1:
            path.append(names[x])
            x = prev[x]
        cents = (cost[dst] * 220 + passengers) // (2 * passengers)
        lines.append(f"Query #{q}")
        lines.append(" ".join(reversed(path)))
        lines.append(f"Each passenger has to pay : {cents // 100}.{cents % 100:02d} taka")
    blocks.append("\n".join(lines))
sys.stdout.write("\n\n".join(blocks) + ("\n" if blocks else ""))
