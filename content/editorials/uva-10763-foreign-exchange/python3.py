import sys
from collections import Counter
values=iter(map(int,sys.stdin.buffer.read().split()))
for n in values:
    if n==0:
        break
    trips=[(next(values),next(values)) for _ in range(n)]
    print('YES' if Counter(trips)==Counter((b,a) for a,b in trips) else 'NO')
