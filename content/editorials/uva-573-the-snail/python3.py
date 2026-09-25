import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for h in values:
    u,d,f=next(values),next(values),next(values)
    if h==0:
        break
    height,climb,fatigue=0,u*100,u*f
    day=0
    while True:
        day+=1
        height+=max(0,climb)
        if height>h*100:
            print(f'success on day {day}')
            break
        height-=d*100
        if height<0:
            print(f'failure on day {day}')
            break
        climb-=fatigue
