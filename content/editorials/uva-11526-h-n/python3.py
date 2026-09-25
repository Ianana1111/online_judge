import math
import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    for n in values[1:1 + values[0]]:
        if n <= 0:
            print(0)
            continue
        root = math.isqrt(n)
        total = sum(n // i for i in range(1, root + 1))
        print(2 * total - root * root)
