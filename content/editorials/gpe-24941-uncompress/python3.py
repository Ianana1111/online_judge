import sys

def letter(c):
    return 65 <= c <= 90 or 97 <= c <= 122

def digit(c):
    return 48 <= c <= 57

lines = []
for line in sys.stdin.buffer:
    line = line.rstrip(b'\r\n')
    if line == b'0':
        break
    lines.append(line+b'\n')
text = b''.join(lines)
events = 0
i = 0
while i < len(text):
    if letter(text[i]) or digit(text[i]):
        test = letter if letter(text[i]) else digit
        events += 1
        while i < len(text) and test(text[i]):
            i += 1
    else:
        i += 1

tree = [0]*(events+1)
words = [None]*(events+1)
def update(p, delta):
    while p <= events:
        tree[p] += delta
        p += p & -p

def kth(k):
    p = 0
    step = 1 << (events.bit_length()-1)
    while step:
        q = p+step
        if q <= events and tree[q] < k:
            p = q
            k -= tree[q]
        step >>= 1
    return p+1

front = events+1
i = 0
out = sys.stdout.buffer
while i < len(text):
    start = i
    if letter(text[i]):
        while i < len(text) and letter(text[i]):
            i += 1
        word = text[start:i]
    elif digit(text[i]):
        while i < len(text) and digit(text[i]):
            i += 1
        old = kth(int(text[start:i]))
        word = words[old]
        words[old] = None
        update(old, -1)
    else:
        while i < len(text) and not letter(text[i]) and not digit(text[i]):
            i += 1
        out.write(text[start:i])
        continue
    front -= 1
    words[front] = word
    update(front, 1)
    out.write(word)
