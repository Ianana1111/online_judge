import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    for case_number, n in enumerate(values[1:1 + values[0]], 1):
        digits = []
        while True:
            bit = n % 2
            digits.append(str(bit))
            n = (n - bit) // -2
            if n == 0:
                break
        print(f"Case #{case_number}: {''.join(reversed(digits))}")
