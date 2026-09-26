import sys
from functools import lru_cache

@lru_cache(maxsize=8)
def solve(n):
    pairs = [(x, y) for x in range(1, n+1) for y in range(x+1, n+1)]
    active = pairs
    answers = [[] for _ in range(101)]
    empty_rounds = 0
    for turn in range(101):
        frequency = [0] * (n*n+1)
        if turn % 2:
            values = [x*y for x, y in active]
        else:
            values = [x+y for x, y in active]
        for value in values:
            frequency[value] += 1
        remaining = []
        for pair, value in zip(active, values):
            if frequency[value] == 1:
                answers[turn].append(pair)
            else:
                remaining.append(pair)
        empty_rounds = 0 if answers[turn] else empty_rounds + 1
        if empty_rounds == 2:
            break
        active = remaining
    return answers

values = iter(map(int, sys.stdin.buffer.read().split()))
for n in values:
    answer = solve(n)[next(values)]
    sys.stdout.write(str(len(answer)) + '\n')
    sys.stdout.write(''.join(f'{x} {y}\n' for x, y in answer))
