import sys

values = list(map(int, sys.stdin.buffer.read().split()))
index = 0
while index < len(values):
    n = values[index]
    index += 1
    if n == 0:
        break
    balance = 0
    work = 0
    for _ in range(n):
        balance += values[index]
        index += 1
        work += abs(balance)
    print(work)
