import sys

key = b'22233344455566677778889999'
for token in sys.stdin.buffer.read().split():
    text = bytearray(token)
    letters = 0
    hyphens = 0
    for i, ch in enumerate(text):
        if ord('A') <= ch <= ord('Z'):
            letters += 1
            text[i] = key[ch - ord('A')]
        elif ch == ord('-'):
            hyphens += 1
    sys.stdout.buffer.write(text + f" {letters} {hyphens}\n".encode())
