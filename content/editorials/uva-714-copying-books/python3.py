import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for _ in range(data[0]) if data else []:
    n,k=data[at:at+2];at+=2;pages=data[at:at+n];at+=n
    low=max(pages);high=sum(pages)
    while low<high:
        limit=(low+high)//2;current=0;groups=1
        for value in pages:
            if current+value>limit:groups+=1;current=0
            current+=value
        if groups<=k:high=limit
        else:low=limit+1
    split=[False]*n;current=0;groups=k
    for i in range(n-1,-1,-1):
        if current+pages[i]>low or i+1<groups:
            split[i]=True;groups-=1;current=0
        current+=pages[i]
    line=[]
    for i,value in enumerate(pages):
        line.append(str(value))
        if split[i]:line.append('/')
    out.append(' '.join(line))
sys.stdout.write('\n'.join(out))
