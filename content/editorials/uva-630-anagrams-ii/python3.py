import sys
data = sys.stdin.buffer.read().split()
if not data:
    sys.exit()
i = 1
groups = []
for _ in range(int(data[0])):
    n = int(data[i]); i += 1
    words = data[i:i + n]; i += n
    keys = [bytes(sorted(word)) for word in words]
    lines = []
    while data[i] != b'END':
        query = data[i]; i += 1
        key = bytes(sorted(query))
        lines.append(f'Anagrams for: {query.decode()}')
        matches = [word.decode() for word, signature in zip(words, keys) if signature == key]
        if matches:
            for number, word in enumerate(matches, 1):
                lines.append(f'{number:3d}) {word}')
        else:
            lines.append(f'No anagrams for: {query.decode()}')
    i += 1
    groups.append('\n'.join(lines))
sys.stdout.write('\n\n'.join(groups))
