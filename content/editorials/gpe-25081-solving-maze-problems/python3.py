import collections
import sys
rows=sys.stdin.buffer.read().split();
if len(rows)==10:
    grid=[bytearray(row) for row in rows]
    start=goal=-1
    for r in range(10):
        for c in range(10):
            if grid[r][c]==ord('S'):start=10*r+c
            if grid[r][c]==ord('G'):goal=10*r+c
    parent=[-1]*100;parent[start]=start;pending=collections.deque([start])
    while pending:
        u=pending.popleft()
        for dr,dc in ((-1,0),(0,1),(1,0),(0,-1)):
            r,c=u//10+dr,u%10+dc
            if 0<=r<10 and 0<=c<10 and grid[r][c]!=ord('#'):
                v=10*r+c
                if parent[v]<0:parent[v]=u;pending.append(v)
    if parent[goal]<0:sys.stdout.write('No solution\n\n')
    else:
        at=goal
        while True:
            grid[at//10][at%10]=ord('+')
            if at==start:break
            at=parent[at]
        sys.stdout.buffer.write(b'\n'.join(grid)+b'\n\n')
