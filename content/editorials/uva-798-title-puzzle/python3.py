import sys
from functools import lru_cache

values = iter(map(int, sys.stdin.buffer.read().split()))
for width in values:
    height, n = next(values), next(values)
    groups = [(next(values), next(values), next(values)) for _ in range(n)]
    area = width*height
    full = (1 << area)-1
    multipliers = []
    code = 0
    base = 1
    anchors = [[] for _ in range(area)]
    for g, (count, a, b) in enumerate(groups):
        multipliers.append(base)
        code += count*base
        base *= count+1
        orientations = [(a, b)] if a == b else [(a, b), (b, a)]
        for w, h in orientations:
            for row in range(height-h+1):
                for col in range(width-w+1):
                    mask = 0
                    for y in range(row, row+h):
                        for x in range(col, col+w):
                            mask |= 1 << (y*width+x)
                    anchors[row*width+col].append((mask, g))
    @lru_cache(None)
    def solve(occupied, remaining):
        if occupied == full:
            return int(remaining == 0)
        cell = ((full ^ occupied) & -(full ^ occupied)).bit_length()-1
        answer = 0
        for mask, g in anchors[cell]:
            if mask & occupied or not remaining//multipliers[g] % (groups[g][0]+1):
                continue
            answer += solve(occupied | mask, remaining-multipliers[g])
        return answer
    print(solve(0, code))
    solve.cache_clear()
