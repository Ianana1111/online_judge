import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
lists=next(values);size=next(values)
previous=0
for i in range(lists):
    current=0
    for _ in range(size-i):
        current^=next(values)
    if i:
        print(previous^current)
    previous=current
