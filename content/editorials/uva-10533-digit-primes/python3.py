import sys
from array import array

limit = 1000000
prime = bytearray(b'\x01') * limit
prime[0] = prime[1] = 0
for p in range(2, 1000):
    if prime[p]:
        prime[p*p:limit:p] = b'\x00' * len(prime[p*p:limit:p])
prefix = array('I', [0]) * limit
for value in range(1, limit):
    digit_sum = 0
    rest = value
    while rest:
        digit_sum += rest % 10
        rest //= 10
    prefix[value] = prefix[value - 1] + (prime[value] and prime[digit_sum])

def numbers():
    value = 0
    reading = False
    while True:
        chunk = sys.stdin.buffer.read(65536)
        if not chunk:
            break
        for ch in chunk:
            if ord('0') <= ch <= ord('9'):
                value = value * 10 + ch - ord('0')
                reading = True
            elif reading:
                yield value
                value = 0
                reading = False
    if reading:
        yield value

tokens = iter(numbers())
queries = next(tokens, 0)
output = sys.stdout.write
for _ in range(queries):
    left, right = next(tokens), next(tokens)
    output(str(prefix[right] - prefix[left - 1]) + '\n')
