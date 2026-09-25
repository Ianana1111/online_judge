import sys
def prefix(n):
    if n<0:return 0
    count=n+1;bit=1;total=0
    while bit<=n:
        whole,remainder=divmod(count,2*bit)
        total+=whole*bit+max(0,remainder-bit)
        bit*=2
    return total
data=list(map(int,sys.stdin.buffer.read().split()))
out=[]
for i in range(0,len(data),2):
    left,right=data[i:i+2]
    if left==0 and right==0:break
    out.append(f'Case {len(out)+1}: {prefix(right)-prefix(left-1)}')
sys.stdout.write('\n'.join(out))
