import sys
from collections import Counter
values=iter(map(int,sys.stdin.buffer.read().split()))
for n in values:
    if n==0:
        break
    count=Counter(tuple(sorted(next(values) for _ in range(5))) for _ in range(n))
    best=max(count.values())
    print(sum(frequency for frequency in count.values() if frequency==best))
