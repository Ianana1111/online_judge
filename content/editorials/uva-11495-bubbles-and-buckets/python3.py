import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for n in values:
    if n==0:
        break
    tree=[0]*(n+1)
    moves=0
    for i in range(n):
        x=next(values)
        j=x
        not_greater=0
        while j:
            not_greater+=tree[j]
            j-=j&-j
        moves+=i-not_greater
        while x<=n:
            tree[x]+=1
            x+=x&-x
    print('Marcelo' if moves%2 else 'Carlos',moves)
