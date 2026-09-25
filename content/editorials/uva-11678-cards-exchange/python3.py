import sys

values = list(map(int, sys.stdin.buffer.read().split()))
index = 0
while index < len(values):
    n, m = values[index:index + 2]
    index += 2
    if n == 0 and m == 0:
        break
    alice = set(values[index:index + n])
    index += n
    betty = set(values[index:index + m])
    index += m
    print(min(len(alice - betty), len(betty - alice)))
