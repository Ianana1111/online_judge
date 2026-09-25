import sys

values = list(map(int, sys.stdin.buffer.read().split()))
index = 0
while index < len(values):
    n, limit, rate = values[index:index + 3]
    index += 3
    if n == 0:
        break
    morning = sorted(values[index:index + n])
    index += n
    evening = sorted(values[index:index + n], reverse=True)
    index += n
    cost = sum(max(0, a + b - limit) * rate for a, b in zip(morning, evening))
    print(cost)
