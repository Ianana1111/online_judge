import sys
MOD=1000000007
factorial=[1]*1001
for i in range(1,1001):factorial[i]=factorial[i-1]*i%MOD
inverse=[1]*1001;inverse[1000]=pow(factorial[1000],MOD-2,MOD)
for i in range(1000,0,-1):inverse[i-1]=inverse[i]*i%MOD
def choose(n,k):return factorial[n]*inverse[k]%MOD*inverse[n-k]%MOD
data=list(map(int,sys.stdin.buffer.read().split()));out=[]
for tc in range(1,data[0]+1) if data else []:
    n,m,k=data[3*tc-2:3*tc+1];valid=0
    for j in range(m-k+1):
        term=choose(m-k,j)*factorial[n-k-j]%MOD
        valid+=-term if j%2 else term
    out.append(f'Case {tc}: {choose(m,k)*(valid%MOD)%MOD}')
sys.stdout.write('\n'.join(out))
