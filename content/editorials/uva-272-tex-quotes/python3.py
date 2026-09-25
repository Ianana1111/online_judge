import sys

output = bytearray()
opening = True
for ch in sys.stdin.buffer.read():
    if ch == ord('"'):
        output.extend(b"``" if opening else b"''")
        opening = not opening
    else:
        output.append(ch)
sys.stdout.buffer.write(output)
