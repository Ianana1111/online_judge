import sys
tokens=iter(sys.stdin.buffer.read().split())
for _ in range(int(next(tokens))):
    n=int(next(tokens))
    movement=[0]*(n+1)
    position=0
    for i in range(1,n+1):
        command=next(tokens)
        if command==b'LEFT':
            movement[i]=-1
        elif command==b'RIGHT':
            movement[i]=1
        else:
            next(tokens)
            movement[i]=movement[int(next(tokens))]
        position+=movement[i]
    print(position)
