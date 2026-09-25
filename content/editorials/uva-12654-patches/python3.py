import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n,c,t1,t2=data[at:at+4];at+=4;hole=sorted(data[at:at+n]);at+=n
    hole+= [value+c for value in hole];nexts=[]
    for length in (t1,t2):
        nxt=[0]*(2*n);pointer=0
        for i in range(2*n):
            while pointer<2*n and hole[pointer]<=hole[i]+length:pointer+=1
            nxt[i]=pointer
        nexts.append(nxt)
    first,second=nexts;dp=[0]*(2*n+1);answer=None
    for start in range(n):
        end=start+n;dp[end]=0
        for i in range(end-1,start-1,-1):
            a=t1+dp[min(end,first[i])];b=t2+dp[min(end,second[i])]
            dp[i]=a if a<b else b
        if answer is None or dp[start]<answer:answer=dp[start]
    out.append(str(answer))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
