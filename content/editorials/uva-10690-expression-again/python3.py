import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n,m=data[at:at+2];at+=2;k=min(n,m);possible=[0]*(k+1);possible[0]=1<<2500;total=0
    for i in range(n+m):
        value=data[at];at+=1;total+=value
        for count in range(min(k,i+1),0,-1):
            if value>=0:possible[count]|=possible[count-1]<<value
            else:possible[count]|=possible[count-1]>>(-value)
    products=[s*(total-s) for s in range(-2500,2501) if possible[k]>>(s+2500)&1]
    out.append(f'{max(products)} {min(products)}')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
