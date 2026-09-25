import sys

lines = sys.stdin.buffer.read().splitlines()
for index in range(0, len(lines) - 1, 2):
    first, second = lines[index], lines[index + 1]
    count_a = [0] * 26
    count_b = [0] * 26
    for ch in first:
        if ord('a') <= ch <= ord('z'):
            count_a[ch - ord('a')] += 1
    for ch in second:
        if ord('a') <= ch <= ord('z'):
            count_b[ch - ord('a')] += 1
    answer = bytearray()
    for letter in range(26):
        answer.extend(bytes([ord('a') + letter]) * min(count_a[letter], count_b[letter]))
    sys.stdout.buffer.write(answer + b'\n')
