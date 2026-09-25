import sys
prime=bytearray(b'\x01')*1001
prime[0]=prime[1]=0
for p in range(2,32):
    if prime[p]:
        for value in range(p*p,1001,p):
            prime[value]=0
values=iter(map(int,sys.stdin.buffer.read().split()))
for n in values:
    c=next(values)
    choices=[1]+[value for value in range(2,n+1) if prime[value]]
    length=len(choices)
    take=min(length,2*c-length%2)
    start=(length-take)//2
    print(f'{n} {c}:'+''.join(' '+str(value) for value in choices[start:start+take])+'\n')
