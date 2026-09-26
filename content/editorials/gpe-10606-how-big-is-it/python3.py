import sys
import math
from functools import lru_cache

@lru_cache(maxsize=50)
def solve(radius):
    n = len(radius)
    gap = [[2 * math.sqrt(a * b) for b in radius] for a in radius]
    order = []
    positions = []
    used = [False] * n
    best = 2 * sum(radius)

    @lru_cache(maxsize=None)
    def tail(last, remaining):
        # Adjacent-circle constraints alone give a lower bound for any completion.
        if remaining == 0:
            return radius[last]
        result = float('inf')
        for i in range(n):
            if remaining & (1 << i):
                result = min(result, gap[last][i] + tail(i, remaining ^ (1 << i)))
        return result

    def search(width, remaining):
        nonlocal best
        if width >= best:
            return
        if len(order) == n:
            best = width
            return
        if order and positions[-1] + tail(order[-1], remaining) > best + 1e-9:
            return
        candidates = []
        for i in range(n):
            if used[i] or (i > 0 and radius[i] == radius[i-1] and not used[i-1]):
                continue
            center = radius[i]
            for j, previous in enumerate(order):
                required = positions[j] + gap[i][previous]
                if required > center:
                    center = required
            rest = remaining ^ (1 << i)
            candidates.append((center + tail(i, rest), i, center, rest))
        candidates.sort()
        for lower_bound, i, center, rest in candidates:
            if lower_bound > best + 1e-9:
                continue
            used[i] = True
            order.append(i)
            positions.append(center)
            next_width = center + radius[i]
            search(next_width if next_width > width else width, rest)
            positions.pop()
            order.pop()
            used[i] = False

    search(0, (1 << n) - 1)
    return best

tokens = iter(sys.stdin.buffer.read().split())
answers = []
for _ in range(int(next(tokens))):
    n = int(next(tokens))
    answers.append(f'{solve(tuple(sorted(float(next(tokens)) for _ in range(n)))):.3f}')
print('\n'.join(answers))
