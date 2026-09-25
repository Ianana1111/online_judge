import sys
limit=31622;composite=bytearray(limit+1);primes=[]
for p in range(2,limit+1):
    if not composite[p]:
        primes.append(p)
        if p*p<=limit:composite[p*p::p]=b'\x01'*((limit-p*p)//p+1)
data=list(map(int,sys.stdin.buffer.read().split()))
out=[]
for tc in range(data[0]) if data else []:
    low,high=data[2*tc+1:2*tc+3];length=high-low+1
    remaining=list(range(low,high+1));counts=[1]*length
    for p in primes:
        if p*p>high:break
        for value in range((low+p-1)//p*p,high+1,p):
            at=value-low;exponent=0
            while remaining[at]%p==0:
                remaining[at]//=p;exponent+=1
            counts[at]*=exponent+1
    best=0
    for i in range(length):
        if remaining[i]>1:counts[i]*=2
        if counts[i]>counts[best]:best=i
    out.append(f'Between {low} and {high}, {low+best} has a maximum of {counts[best]} divisors.')
sys.stdout.write('\n'.join(out))
