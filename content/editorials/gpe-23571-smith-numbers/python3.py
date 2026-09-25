import sys
def digit_sum(value):
    return sum(map(int, str(value)))
def smith(value):
    remaining = value
    factor_sum = 0
    factors = 0
    divisor = 2
    while divisor * divisor <= remaining:
        while remaining % divisor == 0:
            remaining //= divisor
            factor_sum += digit_sum(divisor)
            factors += 1
        divisor += 1
    if remaining > 1:
        factor_sum += digit_sum(remaining)
        factors += 1
    return factors > 1 and factor_sum == digit_sum(value)
data = list(map(int, sys.stdin.buffer.read().split()))
out = []
for n in data[1:]:
    candidate = n + 1
    while not smith(candidate):
        candidate += 1
    out.append(str(candidate))
sys.stdout.write('\n'.join(out))
