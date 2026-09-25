import sys


ways = [0] * 51
ways[0] = ways[1] = 1
for width in range(2, 51):
    ways[width] = ways[width - 1] + ways[width - 2]

for token in sys.stdin.buffer.read().split():
    width = int(token)
    if width == 0:
        break
    print(ways[width])
