import sys
values = map(int, sys.stdin.buffer.read().split())
for n in values:
    previous = next(values)
    seen = bytearray(n)
    good = True
    for _ in range(n - 1):
        current = next(values)
        difference = abs(current - previous)
        if difference < 1 or difference >= n or seen[difference]:
            good = False
        else:
            seen[difference] = 1
        previous = current
    print('Jolly' if good else 'Not jolly')
