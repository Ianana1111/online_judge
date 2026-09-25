import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    index = 1
    for _ in range(values[0]):
        target, count = values[index:index + 2]
        index += 2
        possible = [False] * (target + 1)
        possible[0] = True
        for length in values[index:index + count]:
            if length <= target:
                for total in range(target, length - 1, -1):
                    if possible[total - length]:
                        possible[total] = True
        index += count
        print('YES' if possible[target] else 'NO')
