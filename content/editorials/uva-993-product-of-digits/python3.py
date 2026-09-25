import sys
data = list(map(int, sys.stdin.buffer.read().split()))
out = []
for n in data[1:]:
    if n < 2:
        out.append(str(n))
        continue
    rest = n
    exponent = []
    for prime in (2, 3, 5, 7):
        count = 0
        while rest % prime == 0:
            count += 1
            rest //= prime
        exponent.append(count)
    if rest != 1:
        out.append('-1')
        continue
    twos, threes, fives, sevens = exponent
    best = None
    for sixes in range(min(twos, threes) + 1):
        remaining_twos = twos - sixes
        remaining_threes = threes - sixes
        digits = ([6] * sixes + [5] * fives + [7] * sevens
                  + [8] * (remaining_twos // 3))
        if remaining_twos % 3:
            digits.append(4 if remaining_twos % 3 == 2 else 2)
        digits += [9] * (remaining_threes // 2)
        if remaining_threes % 2:
            digits.append(3)
        candidate = ''.join(map(str, sorted(digits)))
        if best is None or (len(candidate), candidate) < (len(best), best):
            best = candidate
    out.append(best)
sys.stdout.write('\n'.join(out))
