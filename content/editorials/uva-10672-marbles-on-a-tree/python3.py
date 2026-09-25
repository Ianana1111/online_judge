import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n=data[at];at+=1
    if n==0:break
    children=[[] for _ in range(n)];parent=[-1]*n;balance=[0]*n
    for _ in range(n):
        node,marbles,count=data[at:at+3];at+=3;node-=1
        balance[node]=marbles-1
        for _ in range(count):
            child=data[at]-1;at+=1
            children[node].append(child);parent[child]=node
    root=parent.index(-1);order=[root]
    for node in order:order.extend(children[node])
    moves=0
    for node in reversed(order[1:]):
        moves+=abs(balance[node]);balance[parent[node]]+=balance[node]
    out.append(str(moves))
sys.stdout.write('\n'.join(out))
