import sys

def read_map(tokens):
    edges = []
    while True:
        a, b = next(tokens), next(tokens)
        if a == b'*':
            next(tokens)
            return edges
        edges.append((a, b))

def consistent(old_edges, new_edges):
    old_nodes = {v for edge in old_edges for v in edge}
    new_nodes = {v for edge in new_edges for v in edge}
    if not old_nodes <= new_nodes:
        return False
    parent = {v: v for v in new_nodes-old_nodes}
    size = {v: 1 for v in parent}
    def find(v):
        while parent[v] != v:
            parent[v] = parent[parent[v]]
            v = parent[v]
        return v
    for a, b in new_edges:
        if a in parent and b in parent:
            a, b = find(a), find(b)
            if a != b:
                if size[a] < size[b]:
                    a, b = b, a
                parent[b] = a
                size[a] += size[b]
    direct = set()
    attachments = {v: set() for v in old_nodes}
    for a, b in new_edges:
        if a in old_nodes and b in old_nodes:
            direct.add(frozenset((a, b)))
        elif a in old_nodes:
            attachments[a].add(find(b))
        elif b in old_nodes:
            attachments[b].add(find(a))
    for a, b in old_edges:
        if a == b or frozenset((a, b)) in direct:
            continue
        if attachments[a].isdisjoint(attachments[b]):
            return False
    return True

tokens = iter(sys.stdin.buffer.read().split())
for old_name in tokens:
    if old_name == b'END':
        break
    old_edges = read_map(tokens)
    new_name = next(tokens)
    new_edges = read_map(tokens)
    good = consistent(old_edges, new_edges)
    answer = ('YES: ' if good else 'NO: ')+new_name.decode()
    answer += ' is '+('' if good else 'not ')
    print(answer+'a more detailed version of '+old_name.decode())
