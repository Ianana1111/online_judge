import sys
from array import array
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n,m=data[at:at+2];at+=2
    if n==0 and m==0:break
    west=[array('q',[0])*(m+1) for _ in range(n+1)]
    north=[array('q',[0])*(m+1) for _ in range(n+1)]
    for i in range(1,n+1):
        for j in range(1,m+1):west[i][j]=data[at]+west[i][j-1];at+=1
    for i in range(1,n+1):
        for j in range(1,m+1):north[i][j]=data[at]+north[i-1][j];at+=1
    dp=[0]*(m+1)
    for i in range(1,n+1):
        for j in range(1,m+1):dp[j]=max(dp[j]+west[i][j],dp[j-1]+north[i][j])
    out.append(str(dp[m]))
sys.stdout.write('\n'.join(out))
