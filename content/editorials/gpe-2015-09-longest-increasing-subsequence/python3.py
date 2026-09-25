import sys
from bisect import bisect_left
values=iter(map(int,sys.stdin.buffer.read().split()))
for n in values:
    tails=[]
    for _ in range(n):
        value=next(values)
        position=bisect_left(tails,value)
        if position==len(tails):
            tails.append(value)
        else:
            tails[position]=value
    print(len(tails))
