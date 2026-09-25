import sys
data = list(map(int, sys.stdin.buffer.read().split()))
i = 0
out = []
while i < len(data):
    n = data[i]; i += 1
    if n == 0:
        break
    weight = []
    load = []
    for _ in range(n):
        weight.append(data[i])
        load.append(data[i + 1])
        i += 2
    best = [3_000_001] * (n + 1)
    best[0] = 0
    height = 0
    for box in range(n - 1, -1, -1):
        for h in range(height, -1, -1):
            if best[h] <= load[box]:
                best[h + 1] = min(best[h + 1], best[h] + weight[box])
                height = max(height, h + 1)
    out.append(str(height))
sys.stdout.write('\n'.join(out))
