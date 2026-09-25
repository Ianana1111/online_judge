import sys

output = bytearray()
word = bytearray()
for ch in sys.stdin.buffer.read():
    if ch in b' \t\n\r\v\f':
        output.extend(reversed(word))
        word.clear()
        output.append(ch)
    else:
        word.append(ch)
output.extend(reversed(word))
sys.stdout.buffer.write(output)
