import sys

def append(program, op, count):
    if not count:
        return
    if program and program[-1][0] == op:
        program[-1] = (op, program[-1][1]+count)
    else:
        program.append((op, count))

def lex_less(a, b):
    i = j = used_a = used_b = 0
    while i < len(a) and j < len(b):
        if a[i][0] != b[j][0]:
            return a[i][0] < b[j][0]
        take = min(a[i][1]-used_a, b[j][1]-used_b)
        used_a += take
        used_b += take
        if used_a == a[i][1]:
            i += 1
            used_a = 0
        if used_b == b[j][1]:
            j += 1
            used_b = 0
    return i == len(a) and j < len(b)

def solve(a, m, p, q, r, s):
    powers = [1]
    best = None
    best_length = None
    k = 0
    while q*powers[k] <= s:
        low = max(0, (r-p*powers[k]+a-1)//a)
        high = (s-q*powers[k])//a
        if low <= high:
            for unit in powers:
                value = (low+unit-1)//unit*unit
                if value > high:
                    continue
                program = []
                rest = value
                length = k
                for pos in range(k, -1, -1):
                    count, rest = divmod(rest, powers[pos])
                    length += count
                    append(program, 'A', count)
                    if pos:
                        append(program, 'M', 1)
                if (best is None or length < best_length
                        or length == best_length and lex_less(program, best)):
                    best, best_length = program, length
        if m == 1 or powers[k] > s//m:
            break
        powers.append(powers[k]*m)
        k += 1
    if best is None:
        return 'impossible'
    return ' '.join(str(count)+op for op, count in best) or 'empty'

values = iter(map(int, sys.stdin.buffer.read().split()))
case = 0
for a in values:
    m, p, q, r, s = [next(values) for _ in range(5)]
    if not a:
        break
    case += 1
    print('Case {}: {}'.format(case, solve(a, m, p, q, r, s)))
