import bisect
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[];offset=1<<30
while at<len(data) and data[at]:
    n=data[at];at+=1;values=sorted(data[at:at+n]);at+=n
    keys=[((values[i]+values[j]+offset)<<20)|(i<<10)|j for i in range(n) for j in range(i+1,n)]
    keys.sort();answer=None
    for d in range(n-1,-1,-1):
        for c in range(n):
            if c==d:continue
            wanted=(values[d]-values[c]+offset)<<20
            pos=bisect.bisect_left(keys,wanted)
            while pos<len(keys) and keys[pos]>>20==wanted>>20:
                i=(keys[pos]>>10)&1023;j=keys[pos]&1023
                if i!=c and i!=d and j!=c and j!=d:
                    answer=values[d];break
                pos+=1
            if answer is not None:break
        if answer is not None:break
    out.append(str(answer) if answer is not None else 'no solution')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
