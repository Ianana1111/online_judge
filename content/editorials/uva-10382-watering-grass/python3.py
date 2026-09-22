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


def solve(length, width, sprinklers):
    if length == 0:
        return 0
    intervals = []
    for center, radius in sprinklers:
        square = 4 * radius * radius - width * width
        if square <= 0:
            continue
        intervals.append(((2 * center, -1, square), (2 * center, 1, square)))
    intervals.sort(key=cmp_to_key(lambda a, b: compare(a[0], b[0])))
    covered, goal = (0, 1, 0), (2 * length, 1, 0)
    at = answer = 0
    while compare(covered, goal) < 0:
        farthest = covered
        while at < len(intervals) and compare(intervals[at][0], covered) <= 0:
            if compare(intervals[at][1], farthest) > 0:
                farthest = intervals[at][1]
            at += 1
        if compare(farthest, covered) <= 0:
            return -1
        covered = farthest
        answer += 1
    return answer

data = list(map(int, sys.stdin.buffer.read().split()))
at = 0
answers = []
while at < len(data):
    count, length, width = data[at:at + 3]
    at += 3
    sprinklers = [(data[i], data[i + 1]) for i in range(at, at + 2 * count, 2)]
    at += 2 * count
    answers.append(str(solve(length, width, sprinklers)))
print('\n'.join(answers))
