import math
import sys

total = [0] * 501
for right in range(2, 501):
    total[right] = total[right - 1]
    for left in range(1, right):
        total[right] += math.gcd(left, right)
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    print(total[n])
