import sys
for token in sys.stdin.buffer.read().split():
    n=int(token)
    previous=current=1
    for _ in range(2,n+1):
        previous,current=current,previous+current
    print(current)
