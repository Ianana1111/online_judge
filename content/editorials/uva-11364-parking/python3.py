import sys


values = list(map(int, sys.stdin.buffer.read().split()))
index = 1
for _ in range(values[0]):
    count = values[index]
    index += 1
    positions = values[index:index + count]
    index += count
    print(2 * (max(positions) - min(positions)))
