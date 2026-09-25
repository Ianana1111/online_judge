import sys
prime=bytearray([1])*10001;prime[0]=prime[1]=0
for p in range(2,101):
    if prime[p]:
        for j in range(p*p,10001,p):prime[j]=0
values=[v for v in range(2,10001) if prime[v]]
out=[]
for token in sys.stdin.buffer.read().split():
    target=int(token)
    if target==0:break
    left=total=answer=0
    for value in values:
        if value>target:break
        total+=value
        while total>target:
            total-=values[left];left+=1
        if total==target:answer+=1
    out.append(str(answer))
sys.stdout.write('\n'.join(out))
