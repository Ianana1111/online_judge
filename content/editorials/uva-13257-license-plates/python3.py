import bisect
import sys
data=sys.stdin.buffer.read().split();out=[]
for word in data[1:] if data else []:
    positions=[[] for _ in range(26)]
    for i,ch in enumerate(word):positions[ch-65].append(i)
    answer=0
    for a in range(26):
        if not positions[a]:continue
        first=positions[a][0]
        for b in range(26):
            at=bisect.bisect_right(positions[b],first)
            if at==len(positions[b]):continue
            second=positions[b][at]
            for c in range(26):
                if bisect.bisect_right(positions[c],second)<len(positions[c]):answer+=1
    out.append(str(answer))
sys.stdout.write('\n'.join(out))
