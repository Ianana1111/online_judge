import sys

def decode_message(key, shift, message):
    key_set = set(key)
    decode = lambda ch: chr((ord(ch) - 65 - shift) % 26 + 65)
    out = []
    i = position = 0
    while i < len(message):
        if message[i] == ' ':
            out.append(' ')
            i += 1
            continue
        wrapped = (bool(key) and i + 2 < len(message)
                   and ' ' not in message[i:i + 3]
                   and message[i] == key[position]
                   and message[i + 2] == key[(position + 1) % len(key)]
                   and decode(message[i + 1]) in key_set)
        if wrapped:
            out.append(decode(message[i + 1]))
            position = (position + 1) % len(key)
            i += 3
        else:
            plain = decode(message[i])
            if plain in key_set:
                return 'error in encryption'
            out.append(plain)
            i += 1
    return ''.join(out)

lines = sys.stdin.read().splitlines()
tests = int(lines[0])
at = 1
answers = []
for _ in range(tests):
    while at < len(lines) and not lines[at].strip() and (at + 1 == len(lines) or not lines[at + 1].strip().isdigit()):
        at += 1
    key = lines[at].strip()
    shift, count = int(lines[at + 1]), int(lines[at + 2])
    at += 3
    answers.append('\n'.join(decode_message(key, shift, message) for message in lines[at:at + count]))
    at += count
print('\n\n'.join(answers))
