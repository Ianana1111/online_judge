import bisect
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for tc in range(1,data[0]+1) if data else []:
    n=data[at];at+=1;ads=[]
    for _ in range(n):
        start,length,profit=data[at:at+3];at+=3
        ads.append((start+length,start,profit))
    ads.sort();ends=[ad[0] for ad in ads];best=[0]*(n+1)
    for i,(end,start,profit) in enumerate(ads,1):
        compatible=bisect.bisect_right(ends,start,0,i-1)
        best[i]=max(best[i-1],best[compatible]+profit)
    out.append(f'Case {tc}: {best[n]}')
sys.stdout.write('\n'.join(out))
