import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    index = 1
    for _ in range(values[0]):
        count = values[index]
        index += 1
        positions = sorted(values[index:index + count])
        index += count
        home = positions[count // 2]
        print(sum(abs(position - home) for position in positions))
