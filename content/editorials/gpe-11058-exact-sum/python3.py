import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
answers=[]
for n in values:
    prices=sorted(next(values) for _ in range(n))
    money=next(values)
    left,right=0,n-1
    first=second=0
    while left<right:
        total=prices[left]+prices[right]
        if total<money:
            left+=1
        elif total>money:
            right-=1
        else:
            first,second=prices[left],prices[right]
            left+=1
            right-=1
    answers.append(f'Peter should buy books whose prices are {first} and {second}.')
print('\n\n'.join(answers))
