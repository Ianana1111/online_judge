import re
import sys
from bisect import bisect_left, bisect_right

def half(values):
    sums = [0]*(1 << len(values))
    for mask in range(1, len(sums)):
        bit = mask & -mask
        sums[mask] = sums[mask ^ bit]+values[bit.bit_length()-1]
    return sums

first = True
for line in sys.stdin:
    if line.strip() == '.':
        break
    if not line.strip():
        continue
    values = sorted(map(int, re.findall(r'\d+', line)))
    total = sum(values)
    answers = []
    if total % 2 == 0:
        middle = len(values)//2
        left = half(values[:middle])
        right = sorted((value, mask) for mask, value in enumerate(half(values[middle:])))
        for mask, value in enumerate(left):
            target = total//2-value
            lo = bisect_left(right, (target, -1))
            hi = bisect_right(right, (target, 1 << (len(values)-middle)))
            for index in range(lo, hi):
                answers.append(mask | (right[index][1] << middle))
    def subset(mask):
        return tuple(value for i, value in enumerate(values) if mask >> i & 1)
    subsets = sorted((subset(mask) for mask in answers), key=lambda row: (len(row), row))
    if not first:
        print()
    first = False
    if not subsets:
        print('No such subset')
    else:
        print('{} subsets.'.format(len(subsets)))
        for row in subsets:
            print('{'+ ' '.join(map(str, row)) +'}')
