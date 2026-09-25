import sys
from collections import deque
data=sys.stdin.buffer.read().split();at=0;out=[]
while at<len(data):
    levels,rows,cols=map(int,data[at:at+3]);at+=3
    if levels==0:break
    grid=b''.join(data[at:at+levels*rows]);at+=levels*rows
    start=grid.index(83);finish=grid.index(69)
    distance=[-1]*len(grid);distance[start]=0;ready=deque([start])
    while ready:
        cell=ready.popleft();x=cell%cols;y=cell//cols%rows;z=cell//(cols*rows)
        for dz,dy,dx in ((1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)):
            nz=z+dz;ny=y+dy;nx=x+dx
            if not(0<=nz<levels and 0<=ny<rows and 0<=nx<cols):continue
            neighbor=(nz*rows+ny)*cols+nx
            if grid[neighbor]==35 or distance[neighbor]>=0:continue
            distance[neighbor]=distance[cell]+1;ready.append(neighbor)
    out.append(f'Escaped in {distance[finish]} minute(s).' if distance[finish]>=0 else 'Trapped!')
sys.stdout.write('\n'.join(out))
