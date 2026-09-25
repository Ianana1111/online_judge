import sys

for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    remaining = answer = n
    prime = 2
    while prime * prime <= remaining:
        if remaining % prime == 0:
            answer -= answer // prime
            while remaining % prime == 0:
                remaining //= prime
        prime += 1
    if remaining > 1:
        answer -= answer // remaining
    print(answer)
