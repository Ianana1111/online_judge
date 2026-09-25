import sys

limit = 1299709
prime = bytearray(b'\x01') * (limit + 1)
prime[0] = prime[1] = 0
for p in range(2, 1141):
    if prime[p]:
        prime[p*p:limit+1:p] = b'\x00' * len(prime[p*p:limit+1:p])
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    if prime[n]:
        print(0)
        continue
    lower, upper = n - 1, n + 1
    while not prime[lower]:
        lower -= 1
    while not prime[upper]:
        upper += 1
    print(upper - lower)
