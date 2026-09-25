import sys
lines = sys.stdin.buffer.readline()
if lines:
    count = [0] * 26
    for _ in range(int(lines)):
        for ch in sys.stdin.buffer.readline().upper():
            if 65 <= ch <= 90:
                count[ch - 65] += 1
    for i in sorted(range(26), key=lambda i: (-count[i], i)):
        if count[i]:
            print(chr(65 + i), count[i])
