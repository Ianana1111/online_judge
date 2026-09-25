import sys
data=list(map(int,sys.stdin.buffer.read().split()))
out=[]
for tc in range(data[0]) if data else []:
    n,m=data[2*tc+1:2*tc+3]
    out.append(str(int(((n-m)&((m-1)//2))==0)))
sys.stdout.write('\n\n'.join(out))
