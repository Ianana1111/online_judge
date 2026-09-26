import sys
from array import array
from math import gcd

values = iter(map(int, sys.stdin.buffer.read().split()))
answers = []
for _ in range(next(values)):
    n = next(values)
    milk = []
    period = 1
    for i in range(n):
        length = next(values)
        milk.append([next(values) for _ in range(length)])
        period = period//gcd(period, length)*length
    order = []
    for phase in range(period):
        buckets = [[] for _ in range(251)]
        for i, row in enumerate(milk):
            buckets[row[phase % len(row)]].append(i)
        order.append(array('H', (cow for bucket in buckets for cow in bucket)))
    alive = bytearray([1])*n
    first, second = [0]*period, [1]*period
    day = last = idle = 0
    remaining = n
    while remaining and idle < period:
        phase = day % period
        row = order[phase]
        a, b = first[phase], second[phase]
        while a < n and not alive[row[a]]:
            a += 1
        b = max(b, a+1)
        while b < n and not alive[row[b]]:
            b += 1
        first[phase], second[phase] = a, b
        cow = row[a]
        day += 1
        if (b == n or milk[cow][phase % len(milk[cow])]
                < milk[row[b]][phase % len(milk[row[b]])]):
            alive[cow] = 0
            remaining -= 1
            last, idle = day, 0
        else:
            idle += 1
    answers.append('{} {}'.format(remaining, last))
print('\n'.join(answers))
