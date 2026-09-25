import sys
data = list(map(int, sys.stdin.buffer.read().split()))
if not data:
    sys.exit()
i = 1
groups = []
for tc in range(1, data[0] + 1):
    cost = data[i:i + 36]
    i += 36
    queries = data[i]
    i += 1
    lines = [f'Case {tc}:']
    for _ in range(queries):
        number = data[i]
        i += 1
        best = float('inf')
        bases = []
        for base in range(2, 37):
            x = number
            total = 0
            while True:
                total += cost[x % base]
                x //= base
                if x == 0:
                    break
            if total < best:
                best = total
                bases = []
            if total == best:
                bases.append(base)
        lines.append(f"Cheapest base(s) for number {number}: {' '.join(map(str, bases))}")
    groups.append('\n'.join(lines))
sys.stdout.write('\n\n'.join(groups))
