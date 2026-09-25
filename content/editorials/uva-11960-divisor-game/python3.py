import sys
data=list(map(int,sys.stdin.buffer.read().split()))
if data:
    queries=data[1:1+data[0]];limit=max(queries,default=1)
    divisors=[0]*(limit+1)
    for divisor in range(1,limit+1):
        for multiple in range(divisor,limit+1,divisor):divisors[multiple]+=1
    best=[0]*(limit+1);record=1
    for n in range(1,limit+1):
        if divisors[n]>=divisors[record]:record=n
        best[n]=record
    sys.stdout.write('\n'.join(str(best[n]) for n in queries))
