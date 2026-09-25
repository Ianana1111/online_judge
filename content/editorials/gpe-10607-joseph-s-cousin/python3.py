import sys
primes=[]
candidate=2
while len(primes)<3500:
    prime=True
    for p in primes:
        if p*p>candidate:
            break
        if candidate%p==0:
            prime=False
            break
    if prime:
        primes.append(candidate)
    candidate+=1
for token in sys.stdin.buffer.read().split():
    n=int(token)
    if n==0:
        break
    survivor=0
    for size in range(2,n+1):
        survivor=(survivor+primes[n-size])%size
    print(survivor+1)
