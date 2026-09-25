import sys


smallest = [0] * 100001
for value in range(1, 100001):
    target = value
    digits = value
    while digits > 0:
        target += digits % 10
        digits //= 10
    if target <= 100000 and smallest[target] == 0:
        smallest[target] = value

values = list(map(int, sys.stdin.buffer.read().split()))
for target in values[1:1 + values[0]]:
    print(smallest[target])
