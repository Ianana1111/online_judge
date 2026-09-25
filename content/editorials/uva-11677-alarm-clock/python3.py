import sys


values = list(map(int, sys.stdin.buffer.read().split()))
for index in range(0, len(values), 4):
    h1, m1, h2, m2 = values[index:index + 4]
    if h1 == m1 == h2 == m2 == 0:
        break
    wait = (h2 * 60 + m2) - (h1 * 60 + m1)
    if wait <= 0:
        wait += 1440
    print(wait)
