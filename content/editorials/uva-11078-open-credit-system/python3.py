import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    index = 1
    for _ in range(values[0]):
        n = values[index]
        highest = values[index + 1]
        index += 2
        answer = -10**18
        for _ in range(1, n):
            current = values[index]
            index += 1
            answer = max(answer, highest - current)
            highest = max(highest, current)
        print(answer)
