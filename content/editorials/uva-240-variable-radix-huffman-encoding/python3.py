import heapq
import sys

values = iter(map(int, sys.stdin.buffer.read().split()))
case = 0
for radix in values:
    if not radix:
        break
    n = next(values)
    frequency = [next(values) for _ in range(n)]
    nodes = []
    queue = []
    def add(weight, letter, children):
        index = len(nodes)
        nodes.append((letter, children))
        heapq.heappush(queue, (weight, letter, index))
    for i, weight in enumerate(frequency):
        add(weight, i, [])
    dummy = 26
    while len(queue) < radix or (len(queue)-1) % (radix-1):
        add(0, dummy, [])
        dummy += 1
    while len(queue) > 1:
        group = [heapq.heappop(queue) for _ in range(radix)]
        add(sum(item[0] for item in group), min(item[1] for item in group),
            [item[2] for item in group])
    codes = ['']*n
    def visit(index, prefix):
        letter, children = nodes[index]
        if not children:
            if letter < n:
                codes[letter] = prefix
            return
        for digit, child in enumerate(children):
            visit(child, prefix+str(digit))
    visit(queue[0][2], '')
    weighted = sum(weight*len(code) for weight, code in zip(frequency, codes))
    total = sum(frequency)
    rounded = (2*weighted*100+total)//(2*total)
    case += 1
    print('Set {}; average length {}.{:02d}'.format(case, rounded//100, rounded % 100))
    for i, code in enumerate(codes):
        print('    {}: {}'.format(chr(65+i), code))
    print()
