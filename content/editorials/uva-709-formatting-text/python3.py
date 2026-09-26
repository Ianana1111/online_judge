import sys
from functools import lru_cache

@lru_cache(maxsize=5000)
def prefix(gaps, q, r):
    value = 0
    length = 0
    for i in range(gaps):
        gap = q + (i >= gaps-r)
        value = (value << gap) | ((1 << gap)-2)
        length += gap
    return value, length

def less(a, a_length, b, b_length):
    if a_length < b_length:
        extra = b_length-a_length
        a = (a << extra) | ((1 << extra)-1)
    elif b_length < a_length:
        extra = a_length-b_length
        b = (b << extra) | ((1 << extra)-1)
    return a < b

def format_text(width, words):
    n = len(words)
    lengths = list(map(len, words))
    cost = [0] * (n+1)
    for i in range(n-1, -1, -1):
        letters = 0
        best = 10**9
        for j in range(i, n):
            letters += lengths[j]
            gaps = j-i
            if letters+gaps > width:
                break
            if gaps:
                q, r = divmod(width-letters, gaps)
                local = (gaps-r)*(q-1)**2+r*q*q
            else:
                local = 0 if letters == width else 500
            best = min(best, local+cost[j+1])
        cost[i] = best
    code = [1] * (n+1)  # Final all-ones padding denotes the end of the gap list.
    bits = [1] * (n+1)
    following = [0] * n
    for i in range(n-1, -1, -1):
        letters = 0
        chosen = False
        for j in range(i, n):
            letters += lengths[j]
            gaps = j-i
            if letters+gaps > width:
                break
            q, r = divmod(width-letters, gaps) if gaps else (0, 0)
            local = (gaps-r)*(q-1)**2+r*q*q if gaps else (0 if letters == width else 500)
            if local+cost[j+1] != cost[i]:
                continue
            head, head_bits = prefix(gaps, q, r)
            candidate = (head << bits[j+1]) | code[j+1] if head else code[j+1]
            candidate_bits = head_bits+bits[j+1]
            if not chosen or less(candidate, candidate_bits, code[i], bits[i]):
                chosen = True
                code[i], bits[i], following[i] = candidate, candidate_bits, j+1
    lines = []
    i = 0
    while i < n:
        end = following[i]
        gaps = end-i-1
        q, r = divmod(width-sum(lengths[i:end]), gaps) if gaps else (0, 0)
        line = words[i]
        for j in range(i+1, end):
            line += ' '*(q+(j-i-1 >= gaps-r)) + words[j]
        lines.append(line)
        i = end
    return lines

input_lines = iter(sys.stdin)
for line in input_lines:
    if not line.strip():
        continue
    width = int(line)
    if width == 0:
        break
    words = []
    for line in input_lines:
        if not line.strip():
            break
        words.extend(line.split())
    print('\n'.join(format_text(width, words)) + '\n')
