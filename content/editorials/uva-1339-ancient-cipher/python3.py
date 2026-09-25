import sys

tokens = sys.stdin.buffer.read().split()
for index in range(0, len(tokens) - 1, 2):
    first, second = tokens[index:index + 2]
    count_a = [0] * 26
    count_b = [0] * 26
    for ch in first:
        count_a[ch - ord('A')] += 1
    for ch in second:
        count_b[ch - ord('A')] += 1
    print('YES' if sorted(count_a) == sorted(count_b) else 'NO')
