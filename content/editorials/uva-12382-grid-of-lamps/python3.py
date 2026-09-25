import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for _ in range(data[0]) if data else []:
    m,n=data[at:at+2];at+=2
    a=data[at:at+m];at+=m
    frequency=[0]*(m+1);excess=0
    for b in data[at:at+n]:frequency[b]+=1;excess+=b
    at+=n;a.sort(reverse=True)
    prefix=0;answer=excess;positive=n-frequency[0]
    for k,value in enumerate(a,1):
        excess-=positive;positive-=frequency[k];prefix+=value
        answer=max(answer,prefix+excess)
    out.append(str(answer))
sys.stdout.write('\n'.join(out))
