import heapq
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n=data[at];at+=1;products=[]
    for _ in range(n):
        profit,deadline=data[at:at+2];at+=2
        products.append((deadline,profit))
    products.sort();selected=[];total=0
    for deadline,profit in products:
        heapq.heappush(selected,profit);total+=profit
        if len(selected)>deadline:total-=heapq.heappop(selected)
    out.append(str(total))
sys.stdout.write('\n'.join(out))
