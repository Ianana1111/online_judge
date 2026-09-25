import math
import sys

for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    root = math.isqrt(n)
    print('yes' if root * root == n else 'no')
