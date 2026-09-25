import sys
data = list(map(int, sys.stdin.buffer.read().split()))
out = []
case_no = 0
for i in range(0, len(data) - 1, 2):
    start, target = data[i], data[i + 1]
    if start == 0 and target == 0:
        break
    distance = [-1] * (max(start, target) + 1)
    distance[start] = 0
    queue = [start]
    for value in queue:
        remaining = value
        factors = []
        p = 2
        while p * p <= remaining:
            if remaining % p == 0:
                factors.append(p)
                while remaining % p == 0:
                    remaining //= p
            p += 1
        if 1 < remaining < value:
            factors.append(remaining)
        for factor in factors:
            next_value = value + factor
            if next_value <= target and distance[next_value] < 0:
                distance[next_value] = distance[value] + 1
                queue.append(next_value)
    case_no += 1
    out.append(f'Case {case_no}: {distance[target]}')
sys.stdout.write('\n'.join(out))
