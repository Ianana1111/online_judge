import sys
words=set()
word=bytearray()
for ch in sys.stdin.buffer.read():
    if 65<=ch<=90:
        ch+=32
    if 97<=ch<=122:
        word.append(ch)
    elif word:
        words.add(bytes(word))
        word.clear()
if word:
    words.add(bytes(word))
sys.stdout.buffer.write(b'\n'.join(sorted(words))+(b'\n' if words else b''))
