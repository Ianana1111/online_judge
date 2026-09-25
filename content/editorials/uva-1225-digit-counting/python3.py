import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    for n in values[1:1 + values[0]]:
        count = [0] * 10
        for value in range(1, n + 1):
            x = value
            while x > 0:
                count[x % 10] += 1
                x //= 10
        print(' '.join(map(str, count)))
