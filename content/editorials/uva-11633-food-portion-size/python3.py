import math
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data) and data[at]:
    n,a,b=data[at:at+3];at+=3
    appetite=data[at:at+n];at+=n
    frequency=[0]*101
    for value in appetite:frequency[value]+=1
    prefix=frequency[:]
    for y in range(1,101):prefix[y]+=prefix[y-1]
    best_num=None;best_den=1
    largest=max(appetite);total=sum(appetite)
    for p in range(1,101):
        if frequency[p]==0:continue
        for q in (1,2,3):
            if 3*p<largest*q:continue
            visits=3*n-prefix[p//q]-prefix[min(100,2*p//q)]
            num=(a*p+b*q)*visits-a*total*q
            if best_num is None or num*best_den<best_num*q:
                best_num,best_den=num,q
    divisor=math.gcd(best_num,best_den)
    best_num//=divisor;best_den//=divisor
    out.append(str(best_num) if best_den==1 else f'{best_num} / {best_den}')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
