import sys
from functools import cmp_to_key

def sign(value):
    return (value > 0) - (value < 0)

def one_root(constant, coefficient, square):
    if coefficient == 0 or square == 0:
        return sign(constant)
    if constant == 0 or sign(constant) == sign(coefficient):
        return sign(coefficient)
    return sign(constant) * sign(constant * constant - coefficient * coefficient * square)

def compare(a, b):
    # Endpoints are (center, root sign, integer under the square root).
    constant = a[0] - b[0]
    left_sign, left_square = a[1], a[2]
    right_sign, right_square = -b[1], b[2]
    first = one_root(constant, left_sign, left_square)
    if right_square == 0:
        return first
    if first == 0 or first == right_sign:
        return right_sign
    squared = one_root(constant * constant + left_square - right_square,
                       2 * constant * left_sign, left_square)
    return first * squared


def solve(radius, islands):
    intervals = []
    for x, y in islands:
        if y > radius:
            return -1
        square = radius * radius - y * y
        intervals.append(((x, -1, square), (x, 1, square)))
    intervals.sort(key=cmp_to_key(lambda a, b: compare(a[1], b[1])))
    position = None
    answer = 0
    for left, right in intervals:
        if position is None or compare(left, position) > 0:
            position = right
            answer += 1
    return answer

data = list(map(int, sys.stdin.buffer.read().split()))
at = 0
answers = []
while at < len(data):
    count, radius = data[at:at + 2]
    at += 2
    if count == radius == 0:
        break
    islands = [(data[i], data[i + 1]) for i in range(at, at + 2 * count, 2)]
    at += 2 * count
    answers.append(f'Case {len(answers) + 1}: {solve(radius, islands)}')
print('\n'.join(answers))
