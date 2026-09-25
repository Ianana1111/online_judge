import sys
rows = (b'`1234567890-=', b'qwertyuiop[]\\', b"asdfghjkl;'", b'zxcvbnm,./')
decode = bytearray(range(256))
for row in rows:
    for i in range(2, len(row)):
        decode[row[i]] = row[i - 2]
first = sys.stdin.buffer.readline()
if first:
    output = []
    for _ in range(int(first)):
        line = sys.stdin.buffer.readline()
        output.append(bytes(decode[ch + 32 if 65 <= ch <= 90 else ch] for ch in line))
    sys.stdout.buffer.write(b''.join(output))
