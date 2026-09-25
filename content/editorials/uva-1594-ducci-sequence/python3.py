import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    n=next(values)
    state=tuple(next(values) for _ in range(n))
    seen=set()
    while True:
        if all(value==0 for value in state):
            print('ZERO')
            break
        if state in seen:
            print('LOOP')
            break
        seen.add(state)
        state=tuple(abs(state[i]-state[(i+1)%n]) for i in range(n))
