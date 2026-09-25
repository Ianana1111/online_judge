import sys
data=list(map(int,sys.stdin.buffer.read().split()));length=[1,1]
for i in range(2,48):length.append(length[i-2]+length[i-1])
def digit(level,position):
    while level>=2:
        split=length[level-2]
        if position<split:level-=2
        else:position-=split;level-=1
    return str(level)
out=[]
for t in range(data[0]) if data else []:
    n,left,right=data[1+3*t:4+3*t]
    if n>47:n=46+(n-46)%2
    out.append(''.join(digit(n,p) for p in range(left,right+1)))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
