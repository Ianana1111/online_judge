import sys
data=list(map(int,sys.stdin.buffer.read().split()));cache={};out=[]
for at in range(0,len(data),2):
    h,k=data[at:at+2]
    if h==k==0:break
    if (h,k) not in cache:
        best=0
        def search(used,last,coverage,coins):
            global best
            if used==k:
                if coverage>best:best=coverage
                return
            upper=coverage
            for _ in range(used,k):upper=h*(upper+1)
            if upper<=best:return
            for denomination in range(coverage+1,last,-1):
                size=h*denomination+1;nxt=[h+1]*size;nxt[:len(coins)]=coins
                for value in range(denomination,size):
                    candidate=nxt[value-denomination]+1
                    if candidate<nxt[value]:nxt[value]=candidate
                reached=coverage
                while reached+1<size and nxt[reached+1]<=h:reached+=1
                search(used+1,denomination,reached,nxt)
        search(1,1,h,list(range(h+1)));cache[h,k]=best
    out.append(str(cache[h,k]))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
