import random
import sys
from fractions import Fraction

def diameter(a, b):
    x = Fraction(a[0] + b[0], 2)
    y = Fraction(a[1] + b[1], 2)
    return x, y, (x - a[0]) ** 2 + (y - a[1]) ** 2

def outside(circle, point):
    if circle is None:
        return True
    x, y, squared = circle
    return (point[0] - x) ** 2 + (point[1] - y) ** 2 > squared

def through_three(a, b, c):
    ux, uy = b[0] - a[0], b[1] - a[1]
    vx, vy = c[0] - a[0], c[1] - a[1]
    determinant = 2 * (ux * vy - uy * vx)
    if determinant == 0:
        return max((diameter(a, b), diameter(a, c), diameter(b, c)), key=lambda item: item[2])
    u2, v2 = ux * ux + uy * uy, vx * vx + vy * vy
    dx = Fraction(u2 * vy - v2 * uy, determinant)
    dy = Fraction(ux * v2 - vx * u2, determinant)
    return a[0] + dx, a[1] + dy, dx * dx + dy * dy

def minimum_circle(points):
    points = list(points)
    random.Random(10005).shuffle(points)
    circle = None
    for i, a in enumerate(points):
        if not outside(circle, a):
            continue
        circle = (Fraction(a[0]), Fraction(a[1]), Fraction(0))
        for j in range(i):
            b = points[j]
            if not outside(circle, b):
                continue
            circle = diameter(a, b)
            for k in range(j):
                c = points[k]
                if outside(circle, c):
                    circle = through_three(a, b, c)
    return circle

tokens = iter(sys.stdin.buffer.read().split())
for token in tokens:
    count = int(token)
    if count == 0:
        break
    points = [(int(next(tokens)), int(next(tokens))) for _ in range(count)]
    radius = Fraction(next(tokens).decode())
    squared = minimum_circle(points)[2]
    possible = squared <= radius * radius
    print('The polygon can be packed in the circle.' if possible else 'There is no way of packing that polygon.')
