import math
import sys

tokens = sys.stdin.buffer.read().split()
if tokens:
    for case_number in range(1, int(tokens[0]) + 1):
        first = int(tokens[2 * case_number - 1], 2)
        second = int(tokens[2 * case_number], 2)
        possible = math.gcd(first, second) > 1
        message = 'All you need is love!' if possible else 'Love is not all you need!'
        print(f"Pair #{case_number}: {message}")
