import sys

tokens = sys.stdin.buffer.read().split()
for index in range(0, len(tokens) - 1, 2):
    short_text, long_text = tokens[index:index + 2]
    matched = 0
    for ch in long_text:
        if matched < len(short_text) and ch == short_text[matched]:
            matched += 1
    print('Yes' if matched == len(short_text) else 'No')
