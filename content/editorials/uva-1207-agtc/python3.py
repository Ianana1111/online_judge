import sys

def distance(source, target):
    if len(source) > len(target):
        source, target = target, source
    size = len(source)
    if not size:
        return len(target)
    matches = {}
    for i, ch in enumerate(source):
        matches[ch] = matches.get(ch, 0) | (1 << i)
    mask = (1 << size)-1
    highest = 1 << (size-1)
    positive, negative = mask, 0
    score = size
    for ch in target:
        equal = matches.get(ch, 0)
        vertical = equal | negative
        horizontal = (((equal & positive)+positive) ^ positive) | equal
        up = negative | ~(horizontal | positive)
        down = positive & horizontal
        score += bool(up & highest)-bool(down & highest)
        up = (up << 1) | 1
        down <<= 1
        positive = (down | ~(vertical | up)) & mask
        negative = up & vertical
    return score

values = iter(sys.stdin.buffer.read().split())
answers = []
for token in values:
    m = int(token)
    source = next(values) if m else b''
    n = int(next(values))
    target = next(values) if n else b''
    answers.append(str(distance(source, target)))
sys.stdout.write('\n'.join(answers))
