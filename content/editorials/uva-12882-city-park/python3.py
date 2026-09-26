import sys

def integers():
    pending = b''
    while True:
        chunk = sys.stdin.buffer.read(65536)
        if not chunk:
            if pending:
                yield int(pending)
            return
        words = (pending + chunk).split()
        if chunk[-1] > 32:
            pending = words.pop()
        else:
            pending = b''
        for word in words:
            yield int(word)

def solve(n, values):
    parent = list(range(n))
    size = [1] * n
    area = [0] * n
    vertical, horizontal = [], []
    for i in range(n):
        x, y, w, h = next(values), next(values), next(values), next(values)
        area[i] = w * h
        right, top = x + w, y + h
        vertical.append((x, y, top, i))
        vertical.append((right, y, top, i))
        horizontal.append((y, x, right, i))
        horizontal.append((top, x, right, i))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    def join(a, b):
        a, b = find(a), find(b)
        if a == b:
            return
        if size[a] < size[b]:
            a, b = b, a
        parent[b] = a
        size[a] += size[b]
        area[a] += area[b]

    def connect(sides):
        sides.sort()
        line = end = 0
        representative = -1
        for axis, begin, finish, i in sides:
            if representative >= 0 and axis == line and begin <= end:
                join(representative, i)
                if finish > end:
                    end, representative = finish, i
            else:
                line, end, representative = axis, finish, i

    connect(vertical)
    connect(horizontal)
    return max(area[find(i)] for i in range(n))

values = integers()
answers = []
for n in values:
    answers.append(str(solve(n, values)))
print('\n'.join(answers))
