from array import array
from bisect import bisect_left, bisect_right
from collections import Counter
from math import comb, gcd
import sys


def count_subsets(values, target):
    original_target = target
    zeros = values.count(0)
    # Complement the choice of every negative element to obtain nonnegative weights.
    target -= sum(value for value in values if value < 0)
    positive = [abs(value) for value in values if value]
    total = sum(positive)
    if target < 0 or target > total:
        return 0
    target = min(target, total - target)
    positive = [value for value in positive if value <= target]
    if target == 0:
        return (1 << zeros) - (original_target == 0)
    if not positive:
        return 0
    divisor = gcd(*positive)
    if target % divisor:
        return 0
    target //= divisor
    positive = [value // divisor for value in positive]
    if target <= 200000:
        counts = [0] * (target + 1)
        counts[0] = 1
        for value in positive:
            for subtotal in range(target, value - 1, -1):
                counts[subtotal] += counts[subtotal - value]
        return (counts[target] << zeros) - (original_target == 0)

    groups = sorted(Counter(positive).items(), key=lambda pair: -pair[1])
    halves = [[], []]
    sizes = [1, 1]
    for value, count in groups:
        side = 0 if sizes[0] <= sizes[1] else 1
        halves[side].append((value, count))
        sizes[side] *= count + 1
    if max(sizes) <= 150000:
        tables = []
        for half in halves:
            counts = {0: 1}
            for value, count in half:
                following = {}
                choices = [(take * value, comb(count, take)) for take in range(count + 1)]
                for subtotal, ways in counts.items():
                    for added, multiplicity in choices:
                        amount = subtotal + added
                        if amount <= target:
                            following[amount] = following.get(amount, 0) + ways * multiplicity
                counts = following
            tables.append(counts)
        left, right = tables
        answer = sum(ways * right.get(target - amount, 0) for amount, ways in left.items())
        return (answer << zeros) - (original_target == 0)

    middle = min(19, len(positive) // 2)
    sums = [0]
    for value in positive[:middle]:
        size = len(sums)
        sums.extend(sums[i] + value for i in range(size) if sums[i] + value <= target)
    sums.sort()
    left = array('q', sums)
    del sums

    right = positive[middle:]
    current = previous = answer = 0
    for mask in range(1 << len(right)):
        gray = mask ^ (mask >> 1)
        if mask:
            changed = gray ^ previous
            index = changed.bit_length() - 1
            current += right[index] if gray & changed else -right[index]
        wanted = target - current
        if wanted >= 0:
            first = bisect_left(left, wanted)
            if first < len(left) and left[first] == wanted:
                answer += bisect_right(left, wanted, first) - first
        previous = gray
    return (answer << zeros) - (original_target == 0)


def numbers():
    for line in sys.stdin.buffer:
        yield from map(int, line.split())


tokens = iter(numbers())
while True:
    count = next(tokens, None)
    if count is None:
        break
    target = next(tokens)
    print(count_subsets([next(tokens) for _ in range(count)], target))
