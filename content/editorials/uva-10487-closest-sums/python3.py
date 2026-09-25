import sys
from bisect import bisect_left
values=iter(map(int,sys.stdin.buffer.read().split()))
case_number=0
for n in values:
    if n==0:
        break
    a=[next(values) for _ in range(n)]
    sums=sorted(a[i]+a[j] for i in range(n) for j in range(i+1,n))
    case_number+=1
    print(f'Case {case_number}:')
    for _ in range(next(values)):
        target=next(values)
        position=bisect_left(sums,target)
        answer=sums[-1] if position==len(sums) else sums[position]
        if position>0 and abs(sums[position-1]-target)<abs(answer-target):
            answer=sums[position-1]
        print(f'Closest sum to {target} is {answer}.')
