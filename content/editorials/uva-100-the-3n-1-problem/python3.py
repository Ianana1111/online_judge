import sys
from array import array
limit=1000000
memo=array('I',[0])*(limit+1)
memo[1]=1
def cycle_length(n):
    path=[]
    while n>limit or memo[n]==0:
        path.append(n)
        n=n//2 if n%2==0 else 3*n+1
    result=memo[n]
    for value in reversed(path):
        result+=1
        if value<=limit:
            memo[value]=result
    return result
values=iter(map(int,sys.stdin.buffer.read().split()))
for first in values:
    second=next(values)
    answer=max(cycle_length(n) for n in range(min(first,second),max(first,second)+1))
    print(first,second,answer)
