import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    index = 1
    for _ in range(values[0]):
        n = values[index]
        index += 1
        seen = [0] * 100001
        epoch = 1
        answer = 0
        for _ in range(n):
            value = values[index]
            index += 1
            if seen[value] == epoch:
                answer += 1
                epoch += 1
            seen[value] = epoch
        print(answer)
