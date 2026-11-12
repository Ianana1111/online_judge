import sys

data = sys.stdin.buffer.read()
pos = 0


def next_char():
    global pos
    while pos < len(data) and data[pos] in b" \t\r\n":
        pos += 1
    if pos == len(data):
        return None
    pos += 1
    return data[pos - 1]


def next_int():
    global pos
    while data[pos] in b" \t\r\n":
        pos += 1
    start = pos
    while pos < len(data) and data[pos] not in b" \t\r\n":
        pos += 1
    return int(data[start:pos])


out = []
for _ in range(next_int()):
    n = next_int()
    count = [0] * n
    while True:
        ch = next_char()
        if ch is None or ch == ord("#"):
            break
        if ord("A") <= ch < ord("A") + n:
            count[ch - ord("A")] += 1
    ranked = sorted(count, reverse=True)
    used = [False] * n

    def take(a, b):
        for w in range(n):
            if not used[w] and (count[w] == a or count[w] == b):
                used[w] = True
                return w
        raise ValueError("no worker fits this tier")

    order = [0] * n
    right_need = []
    for k in range(n // 2):
        a, b = ranked[2 * k], ranked[2 * k + 1]
        w = take(a, b)
        order[k] = w
        right_need.append(b if count[w] == a else a)
    if n % 2 == 1:
        order[n // 2] = take(ranked[n - 1], ranked[n - 1])
    for k in range(n // 2 - 1, -1, -1):
        order[n - 1 - k] = take(right_need[k], right_need[k])
    out.append(" ".join(chr(ord("A") + w) for w in order))
    out.append(" ".join(str(count[w]) for w in order))
sys.stdout.write("\n".join(out) + ("\n" if out else ""))
