import sys
lines = sys.stdin.buffer.read().splitlines()
position = 0
case_no = 0
out = []
while position < len(lines):
    if not lines[position].strip():
        position += 1
        continue
    k, e = map(int, lines[position].split())
    position += 1
    keywords = set()
    for _ in range(k):
        keywords.add(lines[position].decode())
        position += 1
    excuses = []
    scores = []
    for _ in range(e):
        original = lines[position].decode()
        position += 1
        excuses.append(original)
        words = []
        token = []
        for ch in original:
            if 'a' <= ch <= 'z' or 'A' <= ch <= 'Z':
                token.append(ch.lower())
            elif token:
                words.append(''.join(token))
                token = []
        if token:
            words.append(''.join(token))
        scores.append(sum(word in keywords for word in words))
    best = max(scores, default=0)
    case_no += 1
    out.append(f'Excuse Set #{case_no}')
    out.extend(excuse for excuse, score in zip(excuses, scores) if score == best)
    out.append('')
sys.stdout.write('\n'.join(out) + ('\n' if out else ''))
