import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    value=next(values)
    count=0
    while True:
        value+=int(str(value)[::-1])
        count+=1
        if str(value)==str(value)[::-1]:
            break
    print(count,value)
