import sys
data=list(map(int,sys.stdin.buffer.read().split()));out=[]
for t in range(data[0]) if data else []:
    n,k=data[1+2*t:3+2*t];answer=0
    if n%2==0 and k>0:
        half=n//2;dp=[[0]*k for _ in range(half+1)];dp[1][1%k]=1
        for length in range(1,n):
            nxt=[[0]*k for _ in range(half+1)]
            for ones in range(half+1):
                for residue,ways in enumerate(dp[ones]):
                    if ways:
                        nxt[ones][2*residue%k]+=ways
                        if ones<half:nxt[ones+1][(2*residue+1)%k]+=ways
            dp=nxt
        answer=dp[half][0]
    out.append(f'Case {t+1}: {answer}')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
