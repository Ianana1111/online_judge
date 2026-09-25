import sys
data = sys.stdin.buffer.read().split()
if not data:
    sys.exit()
i = 1
groups = []
for _ in range(int(data[0])):
    length, count = int(data[i]), int(data[i + 1]); i += 2
    entries = []
    for _ in range(count):
        dna = data[i]; i += 1
        score = sum(dna[left] > dna[right]
                    for left in range(length)
                    for right in range(left + 1, length))
        entries.append((score, dna))
    entries.sort(key=lambda entry: entry[0])
    groups.append('\n'.join(dna.decode() for _, dna in entries))
sys.stdout.write('\n\n'.join(groups))
