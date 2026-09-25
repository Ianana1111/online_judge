import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for case_number,n in enumerate(values,1):
    a=[next(values) for _ in range(n)]
    good=all(a[i]>=1 and (i==0 or a[i]>a[i-1]) for i in range(n))
    sums=[a[i]+a[j] for i in range(n) for j in range(i,n)]
    good=good and len(sums)==len(set(sums))
    print(f'Case #{case_number}: It is {"" if good else "not "}a B2-Sequence.\n')
