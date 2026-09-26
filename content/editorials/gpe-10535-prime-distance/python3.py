from array import array
import sys

LIMIT = 100000
MOD = 1000000007
composite = bytearray(LIMIT + 1)
composite[0] = composite[1] = 1
for p in range(2, 317):
    if not composite[p]:
        composite[p*p:LIMIT+1:p] = b'\1' * ((LIMIT-p*p)//p+1)
pc, ps, tc, ts = (array('q', [0]) * (LIMIT + 1) for _ in range(4))
for value in range(1, LIMIT + 1):
    prime = not composite[value]
    twin = value >= 3 and prime and not composite[value - 2]
    pc[value] = pc[value - 1] + prime
    ps[value] = ps[value - 1] + (value if prime else 0)
    tc[value] = tc[value - 1] + twin
    ts[value] = ts[value - 1] + (value if twin else 0)

def choose(n, k):
    if n < k:
        return 0
    answer = 1
    for i in range(k):
        answer = answer * (n - i) % MOD
    return answer * (1, 1, 500000004, 166666668)[k] % MOD

values = iter(int(word) for line in sys.stdin.buffer for word in line.split())
for case in range(1, next(values) + 1):
    n, m = next(values), next(values)
    supports = (0, n, n*pc[n-1]-ps[n-1], 2*(n*tc[n-1]-ts[n-1]), max(0, n-7))
    answer = sum(supports[size] * choose(m-1, size-1) for size in range(1, 5)) % MOD
    print(f'Case {case}: {answer}')
