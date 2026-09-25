import sys
from bisect import bisect_left
values=iter(map(int,sys.stdin.buffer.read().split()))
case_number=0
for n in values:
    q=next(values)
    if n==q==0:
        break
    marbles=sorted(next(values) for _ in range(n))
    case_number+=1
    print(f'CASE# {case_number}:')
    for _ in range(q):
        value=next(values)
        position=bisect_left(marbles,value)
        print(f'{value} found at {position+1}' if position<n and marbles[position]==value else f'{value} not found')
