import sys
from functools import cmp_to_key
values=iter(map(int,sys.stdin.buffer.read().split()))
tests=next(values)
for case_number in range(tests):
    n=next(values)
    jobs=[(next(values),next(values),i+1) for i in range(n)]
    def compare(a,b):
        left=a[0]*b[1]
        right=b[0]*a[1]
        return (left>right)-(left<right) or (a[2]>b[2])-(a[2]<b[2])
    jobs.sort(key=cmp_to_key(compare))
    if case_number:
        print()
    print(*(job[2] for job in jobs))
