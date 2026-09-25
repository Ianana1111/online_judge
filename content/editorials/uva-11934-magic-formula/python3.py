import sys

values = list(map(int, sys.stdin.buffer.read().split()))
for index in range(0, len(values), 5):
    a, b, c, divisor, limit = values[index:index + 5]
    if a == b == c == divisor == limit == 0:
        break
    answer = 0
    for x in range(limit + 1):
        value = (a * x + b) * x + c
        if value % divisor == 0:
            answer += 1
    print(answer)
