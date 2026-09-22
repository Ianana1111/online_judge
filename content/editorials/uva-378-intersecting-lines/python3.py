import sys

def fixed_ratio(numerator, denominator, places):
    if denominator < 0:
        numerator, denominator = -numerator, -denominator
    scale = 10 ** places
    value = (2 * abs(numerator) * scale + denominator) // (2 * denominator)
    sign = '-' if numerator < 0 and value else ''
    return f'{sign}{value // scale}.{value % scale:0{places}d}'

def cross(ax, ay, bx, by):
    return ax * by - ay * bx

tokens = list(map(int, sys.stdin.buffer.read().split()))
print('INTERSECTING LINES OUTPUT')
for case in range(tokens[0]):
    x1, y1, x2, y2, x3, y3, x4, y4 = tokens[1 + case * 8:9 + case * 8]
    ux, uy = x2 - x1, y2 - y1
    vx, vy = x4 - x3, y4 - y3
    dx, dy = x3 - x1, y3 - y1
    denominator = cross(ux, uy, vx, vy)
    if denominator == 0:
        print('LINE' if cross(dx, dy, ux, uy) == 0 else 'NONE')
    else:
        numerator = cross(dx, dy, vx, vy)
        x = x1 * denominator + ux * numerator
        y = y1 * denominator + uy * numerator
        print('POINT', fixed_ratio(x, denominator, 2), fixed_ratio(y, denominator, 2))
print('END OF OUTPUT')
