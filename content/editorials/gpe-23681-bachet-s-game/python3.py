import sys

values = list(map(int, sys.stdin.buffer.read().split()))
index = 0
while index < len(values):
    stones, count = values[index:index + 2]
    index += 2
    moves = values[index:index + count]
    index += count
    winning = bytearray(stones + 1)
    for remaining in range(1, stones + 1):
        for take in moves:
            if take <= remaining and not winning[remaining - take]:
                winning[remaining] = 1
                break
    print('Stan wins' if winning[stones] else 'Ollie wins')
