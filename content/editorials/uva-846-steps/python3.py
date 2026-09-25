import sys
from math import isqrt
values=iter(map(int,sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    distance=next(values)
    distance=next(values)-distance
    if distance==0:
        print(0)
        continue
    root=isqrt(distance)
    moves=2*root-1 if distance==root*root else 2*root if distance<=root*root+root else 2*root+1
    print(moves)
