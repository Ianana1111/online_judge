import sys

ways = [0] * 11
ways[0] = 1
for pairs in range(1, 11):
    for inside in range(pairs):
        ways[pairs] += ways[inside] * ways[pairs - 1 - inside]
values = [int(token) for token in sys.stdin.buffer.read().split()]
sys.stdout.write('\n\n'.join(str(ways[n]) for n in values) + ('\n' if values else ''))
