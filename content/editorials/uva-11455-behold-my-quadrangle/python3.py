import sys
values = iter(map(int, sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    a, b, c, d = sorted(next(values) for _ in range(4))
    if a == d:
        print('square')
    elif a == b and c == d:
        print('rectangle')
    elif a + b + c > d:
        print('quadrangle')
    else:
        print('banana')
