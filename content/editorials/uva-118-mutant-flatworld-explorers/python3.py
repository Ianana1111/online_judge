import sys
lines=iter(sys.stdin.buffer.read().splitlines())
max_x,max_y=map(int,next(lines).split())
scent=set()
directions='NESW'
dx=(0,1,0,-1)
dy=(1,0,-1,0)
for line in lines:
    if not line.strip():
        continue
    x,y,heading=line.split()
    x,y=int(x),int(y)
    direction=directions.index(heading.decode())
    instructions=next(lines).strip()
    lost=False
    for command in instructions:
        if command==76:
            direction=(direction+3)%4
        elif command==82:
            direction=(direction+1)%4
        else:
            nx,ny=x+dx[direction],y+dy[direction]
            if not(0<=nx<=max_x and 0<=ny<=max_y):
                if (x,y) not in scent:
                    scent.add((x,y))
                    lost=True
                    break
            else:
                x,y=nx,ny
    print(x,y,directions[direction]+(' LOST' if lost else ''))
