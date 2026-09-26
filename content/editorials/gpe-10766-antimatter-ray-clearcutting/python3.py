import sys
from functools import lru_cache

def solve(points, target):
    n = len(points)
    bits = [0] * (1 << n)
    for mask in range(1, 1 << n):
        bits[mask] = bits[mask >> 1] + (mask & 1)
    lines = set()
    for i, (x, y) in enumerate(points):
        same = sum(1 << k for k, point in enumerate(points) if point == (x, y))
        if bits[same] >= 3:
            lines.add(same)
        for j in range(i+1, n):
            dx, dy = points[j][0]-x, points[j][1]-y
            if dx == dy == 0:
                continue
            line = sum(1 << k for k, (a, b) in enumerate(points)
                       if (a-x)*dy == (b-y)*dx)
            if bits[line] >= 3:
                lines.add(line)
    lines = sorted(lines, key=lambda mask: bits[mask], reverse=True)

    @lru_cache(maxsize=None)
    def search(removed):
        need = target - bits[removed]
        if need <= 0:
            return 0
        best = (need+1)//2
        for line in lines:
            nxt = removed | line
            if bits[nxt] - bits[removed] < 3:
                continue
            best = min(best, 1+search(nxt))
            if best == 1:
                break
        return best

    return search(0)

values = iter(map(int, sys.stdin.buffer.read().split()))
answers = []
for case in range(1, next(values)+1):
    n, target = next(values), next(values)
    points = [(next(values), next(values)) for _ in range(n)]
    answers.append(f'Case #{case}:\n{solve(points, target)}')
print('\n\n'.join(answers))
