import math
import sys
out = []
for token in sys.stdin.buffer.read().split():
    word = token.decode()
    length = len(word)
    if length > 5 or not all('a' <= ch <= 'z' for ch in word) or any(
            word[i] <= word[i - 1] for i in range(1, length)):
        out.append('0')
        continue
    answer = 1 + sum(math.comb(26, smaller) for smaller in range(1, length))
    previous = -1
    for i, ch in enumerate(word):
        current = ord(ch) - 97
        remaining = length - i - 1
        for candidate in range(previous + 1, current):
            answer += math.comb(25 - candidate, remaining)
        previous = current
    out.append(str(answer))
sys.stdout.write('\n'.join(out))
