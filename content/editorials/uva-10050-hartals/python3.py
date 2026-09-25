import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    days,parties=next(values),next(values)
    stopped=bytearray(days+1)
    for _ in range(parties):
        period=next(values)
        for day in range(period,days+1,period):
            stopped[day]=1
    print(sum(stopped[day] for day in range(1,days+1) if day%7 not in (6,0)))
