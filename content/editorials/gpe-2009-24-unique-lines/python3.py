import sys
from math import gcd

values = iter(map(int, sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    points = [(next(values), next(values)) for _ in range(next(values))]
    lines = set()
    for i, (x, y) in enumerate(points):
        for u, v in points[:i]:
            a, b = v-y, x-u
            c = -(a*x+b*y)
            divisor = gcd(gcd(a, b), c)
            a, b, c = a//divisor, b//divisor, c//divisor
            if a < 0 or a == 0 and b < 0:
                a, b, c = -a, -b, -c
            lines.add((a, b, c))
    print(len(lines))
