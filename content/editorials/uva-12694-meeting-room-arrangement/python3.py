import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    events=[]
    while True:
        start,finish=next(values),next(values)
        if start==finish==0:
            break
        events.append((finish,start))
    events.sort()
    end=answer=0
    for finish,start in events:
        if start>=end:
            answer+=1
            end=finish
    print(answer)
