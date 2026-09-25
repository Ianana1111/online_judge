import sys
tokens = iter(sys.stdin.buffer.read().split())
for token in tokens:
    n = int(token)
    if n == 0:
        break
    top, bottom, north, south, west, east = 1, 6, 2, 5, 3, 4
    for _ in range(n):
        direction = next(tokens)
        if direction == b'north':
            top, bottom, north, south = south, north, top, bottom
        elif direction == b'south':
            top, bottom, north, south = north, south, bottom, top
        elif direction == b'west':
            top, bottom, west, east = east, west, top, bottom
        else:
            top, bottom, west, east = west, east, bottom, top
    print(top)
