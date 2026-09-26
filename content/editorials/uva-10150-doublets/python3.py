import sys
from array import array
from collections import deque

words = []
ids = {}
for line in sys.stdin.buffer:
    word = line.rstrip(b'\r\n')
    if not word:
        break
    if word not in ids:
        ids[word] = len(words)
        words.append(word)
patterns = []
for index, word in enumerate(words):
    code = len(word) << 80
    for k, ch in enumerate(word):
        code |= (ch-96) << (5*k)
    for k in range(len(word)):
        patterns.append(((code & ~(31 << (5*k))) << 15) | index)
patterns.sort()
buckets = [array('I') for word in words]
ending = array('I', [0])*len(patterns)
seen = array('I', [0])*len(patterns)
begin = 0
while begin < len(patterns):
    end = begin+1
    key = patterns[begin] >> 15
    while end < len(patterns) and patterns[end] >> 15 == key:
        end += 1
    ending[begin] = end
    for at in range(begin, end):
        buckets[patterns[at] & 32767].append(begin)
    begin = end
query = 0
for line in sys.stdin.buffer:
    pair = line.split()
    if not pair:
        continue
    start_word, finish_word = pair
    if query:
        print()
    query += 1
    start, finish = ids.get(start_word), ids.get(finish_word)
    if start is None or finish is None or len(start_word) != len(finish_word):
        print('No solution.')
        continue
    previous = [-1]*len(words)
    previous[start] = start
    queue = deque([start])
    while queue and previous[finish] < 0:
        u = queue.popleft()
        for bucket in buckets[u]:
            if seen[bucket] == query:
                continue
            seen[bucket] = query
            for at in range(bucket, ending[bucket]):
                v = patterns[at] & 32767
                if previous[v] < 0:
                    previous[v] = u
                    queue.append(v)
    if previous[finish] < 0:
        print('No solution.')
    else:
        path = []
        u = finish
        while True:
            path.append(words[u])
            if u == start:
                break
            u = previous[u]
        print(b'\n'.join(reversed(path)).decode())
