import sys
from array import array
from collections import deque
tokens=iter(sys.stdin.buffer.read().split());out=[];scenario=0
owner=array('i',[0])*1000000
for first in tokens:
    teams=int(first)
    if teams==0:break
    groups=[deque() for _ in range(teams)]
    for team in range(teams):
        for _ in range(int(next(tokens))):owner[int(next(tokens))]=team
    active=deque();scenario+=1;out.append(f'Scenario #{scenario}')
    for command in tokens:
        if command==b'STOP':break
        if command==b'ENQUEUE':
            member=int(next(tokens));team=owner[member]
            if not groups[team]:active.append(team)
            groups[team].append(member)
        else:
            team=active[0];out.append(str(groups[team].popleft()))
            if not groups[team]:active.popleft()
    out.append('')
sys.stdout.write('\n'.join(out))
