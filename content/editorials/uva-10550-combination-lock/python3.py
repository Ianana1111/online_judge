import sys


values = list(map(int, sys.stdin.buffer.read().split()))
for index in range(0, len(values), 4):
    start, a, b, c = values[index:index + 4]
    if start == a == b == c == 0:
        break
    first = (start - a) % 40
    second = (b - a) % 40
    third = (b - c) % 40
    print((120 + first + second + third) * 9)
