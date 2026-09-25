import sys
from collections import Counter
n=int(sys.stdin.buffer.readline())
counts=Counter(sys.stdin.buffer.readline().split()[0] for _ in range(n))
for country in sorted(counts):
    print(country.decode(),counts[country])
