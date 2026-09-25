import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for case_number,n in enumerate(values,1):
    a=[next(values) for _ in range(n)]
    answer=0
    for left in range(n):
        product=1
        for right in range(left,n):
            product*=a[right]
            answer=max(answer,product)
    print(f'Case #{case_number}: The maximum product is {answer}.\n')
