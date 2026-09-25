import sys
MOD=1000000007
queries=list(map(int,sys.stdin.buffer.read().split()))
largest=max((n//2 for n in queries),default=0)
factorial=[1]*(largest+2)
for i in range(1,largest+2):factorial[i]=factorial[i-1]*i%MOD
out=[]
for n in queries:
    f=factorial[n//2];answer=f*f%MOD
    if n%2:answer=answer*n%MOD
    out.append(str(answer))
sys.stdout.write('\n'.join(out))
