import sys

values = list(map(int, sys.stdin.buffer.read().split()))
for index in range(0, len(values), 3):
    n, bars, maximum = values[index:index + 3]
    ways = [[0] * (n + 1) for _ in range(bars + 1)]
    ways[0][0] = 1
    for used in range(1, bars + 1):
        for total in range(1, n + 1):
            for width in range(1, min(maximum, total) + 1):
                ways[used][total] += ways[used - 1][total - width]
    print(ways[bars][n])
