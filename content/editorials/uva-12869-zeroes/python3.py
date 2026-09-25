import sys

values = list(map(int, sys.stdin.buffer.read().split()))
for index in range(0, len(values), 2):
    low, high = values[index:index + 2]
    if low == 0 and high == 0:
        break
    print(high // 5 - low // 5 + 1)
