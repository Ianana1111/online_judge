import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    index = 1
    for _ in range(values[0]):
        n = values[index]
        index += 1
        coins = values[index:index + n]
        index += n
        total = 0
        types = 0
        for i in range(n - 1):
            if total + coins[i] < coins[i + 1]:
                total += coins[i]
                types += 1
        print(types + 1)
