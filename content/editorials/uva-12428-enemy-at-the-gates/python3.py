import sys
data=list(map(int,sys.stdin.buffer.read().split()));out=[]
for tc in range(data[0]) if data else []:
    n,m=data[2*tc+1:2*tc+3]
    excess=m-(n-1);low=1;high=n
    while low<high:
        mid=(low+high)//2
        if (mid-1)*(mid-2)//2>=excess:high=mid
        else:low=mid+1
    out.append(str(n-low))
sys.stdout.write('\n'.join(out))
