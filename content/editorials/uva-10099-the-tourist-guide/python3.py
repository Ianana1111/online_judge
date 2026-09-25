import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n,roads=data[at:at+2];at+=2
    if n==0 and roads==0:break
    capacity=[[0]*(n+1) for _ in range(n+1)]
    for i in range(1,n+1):capacity[i][i]=10**30
    for _ in range(roads):
        a,b,seats=data[at:at+3];at+=3
        capacity[a][b]=capacity[b][a]=max(capacity[a][b],seats)
    start,target,tourists=data[at:at+3];at+=3
    for via in range(1,n+1):
        for a in range(1,n+1):
            through=capacity[a][via]
            for b in range(1,n+1):
                candidate=min(through,capacity[via][b])
                if candidate>capacity[a][b]:capacity[a][b]=candidate
    trips=0 if start==target else (tourists+capacity[start][target]-2)//(capacity[start][target]-1)
    out.append(f'Scenario #{len(out)+1}\nMinimum Number of Trips = {trips}')
sys.stdout.write('\n\n'.join(out)+'\n\n' if out else '')
