import sys

alphabet = b'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
for line in sys.stdin.buffer:
    count = [0] * 128
    best = 0
    for ch in line:
        if ord('A') <= ch <= ord('Z') or ord('a') <= ch <= ord('z'):
            count[ch] += 1
            best = max(best, count[ch])
    letters = bytes(ch for ch in alphabet if best > 0 and count[ch] == best)
    sys.stdout.buffer.write(letters + b' ' + str(best).encode() + b'\n')
