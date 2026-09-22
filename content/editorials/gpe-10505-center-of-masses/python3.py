import sys

def fixed_ratio(numerator, denominator, places):
    if denominator < 0:
        numerator, denominator = -numerator, -denominator
    scale = 10 ** places
    value = (2 * abs(numerator) * scale + denominator) // (2 * denominator)
    sign = '-' if numerator < 0 and value else ''
    return f'{sign}{value // scale}.{value % scale:0{places}d}'


from functools import cmp_to_key

def centroid(points):
    n = len(points)
    sum_x = sum(x for x, y in points)
    sum_y = sum(y for x, y in points)
    def compare(a, b):
        ax, ay = n * a[0] - sum_x, n * a[1] - sum_y
        bx, by = n * b[0] - sum_x, n * b[1] - sum_y
        half_a = int(ay < 0 or (ay == 0 and ax < 0))
        half_b = int(by < 0 or (by == 0 and bx < 0))
        if half_a != half_b:
            return half_a - half_b
        cross = ax * by - ay * bx
        return -1 if cross > 0 else 1 if cross < 0 else 0
    points = sorted(points, key=cmp_to_key(compare))
    area = moment_x = moment_y = 0
    for i, (x, y) in enumerate(points):
        nx, ny = points[(i + 1) % n]
        cross = x * ny - y * nx
        area += cross
        moment_x += (x + nx) * cross
        moment_y += (y + ny) * cross
    return fixed_ratio(moment_x, 3 * area, 3), fixed_ratio(moment_y, 3 * area, 3)

tokens = iter(map(int, sys.stdin.buffer.read().split()))
for count in tokens:
    if count < 3:
        break
    points = [(next(tokens), next(tokens)) for _ in range(count)]
    print(*centroid(points))
