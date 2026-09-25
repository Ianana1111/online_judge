import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for _ in range(data[0]) if data else []:
    n,m=data[at:at+2];at+=2;limit=n+m;tree=[0]*(limit+1)
    def add(index,delta):
        while index<=limit:tree[index]+=delta;index+=index&-index
    def prefix(index):
        result=0
        while index:result+=tree[index];index-=index&-index
        return result
    position=[0]+[m+i for i in range(1,n+1)]
    for i in range(1,n+1):add(position[i],1)
    top=m;answer=[]
    for movie in data[at:at+m]:
        answer.append(str(prefix(position[movie]-1)))
        add(position[movie],-1);position[movie]=top;top-=1;add(position[movie],1)
    at+=m;out.append(' '.join(answer))
sys.stdout.write('\n'.join(out))
