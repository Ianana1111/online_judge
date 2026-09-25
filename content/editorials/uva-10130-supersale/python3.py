import sys
data = list(map(int, sys.stdin.buffer.read().split()))
if not data:
    sys.exit()
i = 1
out = []
for _ in range(data[0]):
    n = data[i]; i += 1
    best = [0] * 31
    for _ in range(n):
        price, weight = data[i], data[i + 1]
        i += 2
        for capacity in range(30, weight - 1, -1):
            best[capacity] = max(best[capacity], best[capacity - weight] + price)
    people = data[i]; i += 1
    total = 0
    for _ in range(people):
        total += best[data[i]]
        i += 1
    out.append(str(total))
sys.stdout.write('\n'.join(out))
