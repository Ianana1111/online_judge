import sys

tokens = sys.stdin.buffer.read().split()
index = 0
low, high = 1, 10
while index < len(tokens):
    guess = int(tokens[index])
    index += 1
    if guess == 0:
        break
    first, second = tokens[index:index + 2]
    index += 2
    if first == b'too' and second == b'high':
        high = min(high, guess - 1)
    elif first == b'too' and second == b'low':
        low = max(low, guess + 1)
    else:
        print('Stan may be honest' if low <= guess <= high else 'Stan is dishonest')
        low, high = 1, 10
