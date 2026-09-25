import sys
def prefix(n):
    answer=[0]*10;factor=1
    while factor<=n:
        higher=n//(factor*10);digit=n//factor%10;lower=n%factor
        for d in range(1,10):
            answer[d]+=higher*factor
            if digit>d:answer[d]+=factor
            elif digit==d:answer[d]+=lower+1
        if higher>0:answer[0]+=(higher-1)*factor+(lower+1 if digit==0 else factor)
        factor*=10
    return answer
data=list(map(int,sys.stdin.buffer.read().split()));out=[]
for at in range(0,len(data),2):
    a,b=data[at:at+2]
    if a==b==0:break
    if a>b:a,b=b,a
    before=prefix(a-1);after=prefix(b)
    out.append(' '.join(str(after[d]-before[d]) for d in range(10)))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
