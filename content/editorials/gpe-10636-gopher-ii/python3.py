import sys
import math
from fractions import Fraction

def main():
    tokens = iter(sys.stdin.read().split())
    answers = []
    for first in tokens:
        n, m = int(first), int(next(tokens))
        seconds, velocity = int(next(tokens)), int(next(tokens))
        coordinates = [Fraction(next(tokens)) for _ in range(2 * (n + m))]
        scale = 1
        for value in coordinates:
            scale = math.lcm(scale, value.denominator)
        exact = [value.numerator * (scale // value.denominator) for value in coordinates]
        points = list(zip(exact[0::2], exact[1::2]))
        limit = (seconds * velocity * scale) ** 2
        adjacent = []
        for x, y in points[:n]:
            adjacent.append([j for j, (a, b) in enumerate(points[n:])
                             if (x - a) ** 2 + (y - b) ** 2 <= limit])
        owner = [-1] * m
        def augment(gopher, seen):
            for hole in adjacent[gopher]:
                if seen[hole]:
                    continue
                seen[hole] = True
                if owner[hole] < 0 or augment(owner[hole], seen):
                    owner[hole] = gopher
                    return True
            return False
        saved = sum(augment(gopher, [False] * m) for gopher in range(n))
        answers.append(str(n - saved))
    print('\n'.join(answers))

if __name__ == '__main__':
    main()
