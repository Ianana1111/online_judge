import sys
from collections import deque
dx=(1,1,-1,-1,2,2,-2,-2)
dy=(2,-2,2,-2,1,-1,1,-1)
tokens=iter(sys.stdin.buffer.read().split())
for start in tokens:
    target=next(tokens)
    source=(start[0]-97)*8+start[1]-49
    goal=(target[0]-97)*8+target[1]-49
    distance=[-1]*64
    distance[source]=0
    queue=deque([source])
    while queue:
        at=queue.popleft()
        x,y=divmod(at,8)
        for move in range(8):
            nx,ny=x+dx[move],y+dy[move]
            if 0<=nx<8 and 0<=ny<8:
                nxt=nx*8+ny
                if distance[nxt]<0:
                    distance[nxt]=distance[at]+1
                    queue.append(nxt)
    print(f'To get from {start.decode()} to {target.decode()} takes {distance[goal]} knight moves.')
