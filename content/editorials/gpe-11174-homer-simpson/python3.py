import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for m in values:
    n,t=next(values),next(values)
    best=[-1]*(t+1)
    best[0]=0
    for time in range(1,t+1):
        if time>=m and best[time-m]>=0:
            best[time]=max(best[time],best[time-m]+1)
        if time>=n and best[time-n]>=0:
            best[time]=max(best[time],best[time-n]+1)
    used=t
    while best[used]<0:
        used-=1
    print(best[used] if used==t else f'{best[used]} {t-used}')
