import sys

output = bytearray()
for ch in sys.stdin.buffer.read():
    if ch == 10 or ch == 13:
        output.append(ch)
    else:
        decoded = ch - 7
        if decoded < 32:
            decoded += 95
        output.append(decoded)
sys.stdout.buffer.write(output)
