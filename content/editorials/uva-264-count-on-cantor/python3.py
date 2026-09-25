import sys
for token in sys.stdin.buffer.read().split():
    n=int(token)
    low,high=1,10000
    while low<high:
        mid=(low+high)//2
        if mid*(mid+1)//2>=n:
            high=mid
        else:
            low=mid+1
    diagonal=low
    offset=n-diagonal*(diagonal-1)//2
    numerator=diagonal+1-offset if diagonal%2 else offset
    print(f'TERM {n} IS {numerator}/{diagonal+1-numerator}')
