import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    n=next(values)
    last=next(values)
    answer=1
    need_down=True
    for _ in range(n-1):
        current=next(values)
        if (need_down and last>current) or (not need_down and last<current):
            answer+=1
            need_down=not need_down
        last=current
    print(answer)
