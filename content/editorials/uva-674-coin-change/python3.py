import sys

limit = 7489
ways = [0] * (limit + 1)
ways[0] = 1
for coin in (1, 5, 10, 25, 50):
    for amount in range(coin, limit + 1):
        ways[amount] += ways[amount - coin]
for token in sys.stdin.buffer.read().split():
    print(ways[int(token)])
