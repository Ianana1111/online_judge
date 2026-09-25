import sys

tokens = iter(sys.stdin.buffer.read().split())
for token in tokens:
    groups = int(token)
    if groups == 0:
        break
    word = next(tokens)
    size = len(word) // groups
    pieces = []
    for start in range(0, len(word), size):
        pieces.append(word[start:start + size][::-1])
    sys.stdout.buffer.write(b''.join(pieces) + b'\n')
