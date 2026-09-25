import sys
fib = [1, 2]
while fib[-1] < 100000000:
    fib.append(fib[-1] + fib[-2])
values = iter(map(int, sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    original = remaining = next(values)
    digits = []
    for value in reversed(fib):
        if value <= remaining:
            digits.append('1')
            remaining -= value
        elif digits:
            digits.append('0')
    print(f"{original} = {''.join(digits)} (fib)")
