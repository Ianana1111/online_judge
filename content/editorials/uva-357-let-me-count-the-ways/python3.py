import sys

ways = [0] * 30001
ways[0] = 1
for coin in (1, 5, 10, 25, 50):
    for amount in range(coin, 30001):
        ways[amount] += ways[amount - coin]
for token in sys.stdin.buffer.read().split():
    amount = int(token)
    if ways[amount] == 1:
        print(f"There is only 1 way to produce {amount} cents change.")
    else:
        print(f"There are {ways[amount]} ways to produce {amount} cents change.")
