import sys

MOD = 1000000009
BITS = 80
DIGIT_MASK = (1 << BITS)-1

def solve(lower, upper, prime):
    n = len(lower)
    low_digits, high_digits = [], []
    length = 1
    for a, b in zip(lower, upper):
        ld, ud = [], []
        while True:
            ld.append(a % prime)
            ud.append(b % prime)
            a, b = a//prime, b//prime
            if not b:
                break
        low_digits.append(ld)
        high_digits.append(ud)
        length = max(length, len(ud))
    for ld, ud in zip(low_digits, high_digits):
        ld.extend([0]*(length-len(ld)))
        ud.extend([0]*(length-len(ud)))
    limit = (1 << (BITS*prime))-1
    ranges = {}
    for lo in range(prime):
        polynomial = 0
        for hi in range(lo, prime):
            polynomial |= 1 << (BITS*hi)
            ranges[lo, hi] = polynomial
    dp = {(1 << (2*n))-1: 1}
    for pos in range(length-1, -1, -1):
        current = dp
        for coordinate in range(n):
            following = {}
            shift = 2*coordinate
            ld, ud = low_digits[coordinate][pos], high_digits[coordinate][pos]
            for code, polynomial in current.items():
                flag = code >> shift & 3
                if flag == 0:
                    choices = ((0, prime-1, 0),)
                elif flag == 1:
                    choices = ((ld, ld, 1), (ld+1, prime-1, 0))
                elif flag == 2:
                    choices = ((0, ud-1, 0), (ud, ud, 2))
                elif ld == ud:
                    choices = ((ld, ld, 3),)
                else:
                    choices = ((ld, ld, 1), (ld+1, ud-1, 0), (ud, ud, 2))
                base = code & ~(3 << shift)
                for lo, hi, next_flag in choices:
                    if lo > hi:
                        continue
                    contribution = polynomial*ranges[lo, hi] & limit
                    if contribution:
                        target = base | next_flag << shift
                        following[target] = following.get(target, 0)+contribution
            current = following
        dp = {}
        for code, polynomial in current.items():
            total = 0
            while polynomial:
                total += polynomial & DIGIT_MASK
                polynomial >>= BITS
            value = total % MOD
            if value:
                dp[code] = value
    return sum(dp.values()) % MOD

values = iter(map(int, sys.stdin.buffer.read().split()))
for case in range(1, next(values)+1):
    n, prime = next(values), next(values)
    lower = [next(values) for _ in range(n)]
    upper = [next(values) for _ in range(n)]
    print('Case {}: {}'.format(case, solve(lower, upper, prime)))
