import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
def valid(original,level):
    runs=original[:];quotes=sum(runs)
    if quotes%2:return False
    if level==1:return quotes==2
    left=0;right=len(runs)-1
    for layer in range(level,1,-1):
        while left<=right and runs[left]==0:left+=1
        while left<=right and runs[right]==0:right-=1
        if left>right or runs[left]<layer or runs[right]<layer:return False
        if left==right and runs[left]<2*layer:return False
        runs[left]-=layer;runs[right]-=layer;quotes-=2*layer
    return quotes>=2
while at<len(data):
    n=data[at];at+=1;runs=data[at:at+n];at+=n;total=sum(runs);answer=0
    for k in range(min(runs[0],runs[-1]),0,-1):
        if k*(k+1)<=total and valid(runs,k):answer=k;break
    out.append(str(answer) if answer else 'no quotation')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
