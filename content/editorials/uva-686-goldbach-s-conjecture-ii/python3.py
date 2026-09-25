import sys

limit = 32768
prime = bytearray(b'\x01') * limit
prime[0] = prime[1] = 0
for p in range(2, 182):
    if prime[p]:
        prime[p*p:limit:p] = b'\x00' * len(prime[p*p:limit:p])
primes = [value for value in range(2, limit) if prime[value]]
answers = [0] * limit
for i, p in enumerate(primes):
    for q in primes[i:]:
        total = p + q
        if total >= limit:
            break
        answers[total] += 1
result = []
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    result.append(str(answers[n]))
sys.stdout.write('\n'.join(result))
