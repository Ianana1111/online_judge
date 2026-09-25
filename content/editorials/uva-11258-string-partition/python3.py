import sys
data=sys.stdin.buffer.read().split();out=[]
for digits in data[1:] if data else []:
    n=len(digits);best=[0]*(n+1)
    for i in range(n-1,-1,-1):
        if digits[i]==48:best[i]=best[i+1];continue
        value=0
        for j in range(i,min(n,i+10)):
            value=value*10+digits[j]-48
            if value>2147483647:break
            best[i]=max(best[i],value+best[j+1])
    out.append(str(best[0]))
sys.stdout.write('\n'.join(out))
