import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    n=next(values)
    tree=[0]*5001
    answer=0
    for _ in range(n):
        x=next(values)
        j=x
        while j:
            answer+=tree[j]
            j-=j&-j
        while x<=5000:
            tree[x]+=1
            x+=x&-x
    print(answer)
