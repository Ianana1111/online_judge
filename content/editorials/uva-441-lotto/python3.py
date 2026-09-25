import sys
from itertools import combinations
values=iter(map(int,sys.stdin.buffer.read().split()))
first=True
for size in values:
    if size==0:
        break
    numbers=[next(values) for _ in range(size)]
    if not first:
        print()
    first=False
    for chosen in combinations(numbers,6):
        print(*chosen)
