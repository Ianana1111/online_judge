import sys

limit = 1000000
prime = bytearray(b'\x01') * limit
prime[0] = prime[1] = 0
for p in range(2, 1000):
    if prime[p]:
        prime[p*p:limit:p] = b'\x00' * len(prime[p*p:limit:p])
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    answer = 0
    for a in range(3, n // 2 + 1, 2):
        if prime[a] and prime[n - a]:
            answer = a
            break
    if answer:
        print(f"{n} = {answer} + {n - answer}")
    else:
        print("Goldbach's conjecture is wrong.")
