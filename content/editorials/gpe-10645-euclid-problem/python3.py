import sys

def solve(a, b):
    r0, r1, x0, x1, y0, y1 = a, b, 1, 0, 0, 1
    while r1:
        q = r0 // r1
        r0, r1 = r1, r0 - q * r1
        x0, x1 = x1, x0 - q * x1
        y0, y1 = y1, y0 - q * y1
    sx, sy = b // r0, a // r0
    shifts = {0, -x0 // sx, -x0 // sx + 1, y0 // sy, y0 // sy + 1}
    pairs = [(x0 + k * sx, y0 - k * sy) for k in shifts]
    x, y = min(pairs, key=lambda p: (abs(p[0]) + abs(p[1]), p[0] > p[1], p[0], p[1]))
    return f"{x} {y} {r0}"

for line in sys.stdin:
    if line.strip():
        a, b = map(int, line.split())
        print(solve(a, b))
