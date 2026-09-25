import sys
data = sys.stdin.buffer.read().split()
i = 0
out = []
while i < len(data):
    n = int(data[i]); i += 1
    root = {}
    for _ in range(n):
        node = root
        for name in data[i].split(b'\\'):
            node = node.setdefault(name, {})
        i += 1
    def visit(node, depth):
        for name in sorted(node):
            out.append(' ' * depth + name.decode())
            visit(node[name], depth + 1)
    visit(root, 0)
    out.append('')
sys.stdout.write('\n'.join(out) + ('\n' if out else ''))
