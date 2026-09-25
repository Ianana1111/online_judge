import sys
from array import array
data=list(map(int,sys.stdin.buffer.read().split()));out=[]
for tc in range(1,data[0]+1) if data else []:
    n,m,k=data[3*tc-2:3*tc+1]
    values=array('H',[1,2,3]);values.extend([0]*(n-3))
    for i in range(3,n):values[i]=(values[i-1]+values[i-2]+values[i-3])%m+1
    frequency=[0]*(k+1);left=covered=0;best=n+1
    for right,value in enumerate(values):
        if value<=k:
            frequency[value]+=1
            if frequency[value]==1:covered+=1
        while covered==k:
            best=min(best,right-left+1)
            removed=values[left];left+=1
            if removed<=k:
                frequency[removed]-=1
                if frequency[removed]==0:covered-=1
    out.append(f'Case {tc}: {best if best<=n else "sequence nai"}')
sys.stdout.write('\n'.join(out))
