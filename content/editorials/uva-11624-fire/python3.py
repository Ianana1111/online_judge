import sys
from array import array
data=sys.stdin.buffer.read().split();at=1;out=[]
INF=2147483647
for _ in range(int(data[0])) if data else []:
    rows=int(data[at]);cols=int(data[at+1]);at+=2
    grid=b''.join(data[at:at+rows]);at+=rows
    cells=rows*cols;fire=array('i',[INF])*cells
    distance=array('i',[-1])*cells;queue=array('i',[0])*cells
    front=back=0;start=-1
    for id,ch in enumerate(grid):
        if ch==70:
            fire[id]=0;queue[back]=id;back+=1
        elif ch==74:start=id
    while front<back:
        cell=queue[front];front+=1;y,x=divmod(cell,cols)
        for ny,nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
            if not(0<=ny<rows and 0<=nx<cols):continue
            neighbor=ny*cols+nx
            if grid[neighbor]==35 or fire[neighbor]!=INF:continue
            fire[neighbor]=fire[cell]+1;queue[back]=neighbor;back+=1
    front=0;back=1;queue[0]=start;distance[start]=0;answer=-1
    while front<back:
        cell=queue[front];front+=1;y,x=divmod(cell,cols)
        if y==0 or y==rows-1 or x==0 or x==cols-1:
            answer=distance[cell]+1;break
        arrival=distance[cell]+1
        for neighbor in (cell+cols,cell-cols,cell+1,cell-1):
            if grid[neighbor]==35 or distance[neighbor]>=0 or arrival>=fire[neighbor]:continue
            distance[neighbor]=arrival;queue[back]=neighbor;back+=1
    out.append(str(answer) if answer>=0 else 'IMPOSSIBLE')
sys.stdout.write('\n'.join(out))
