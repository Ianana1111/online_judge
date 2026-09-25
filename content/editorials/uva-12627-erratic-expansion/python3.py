import sys
power3=[1]
for _ in range(30):power3.append(power3[-1]*3)
def prefix(k,rows):
    if rows==0:return 0
    if k==0:return 1
    half=1<<(k-1)
    if rows<=half:return 2*prefix(k-1,rows)
    return 2*power3[k-1]+prefix(k-1,rows-half)
data=list(map(int,sys.stdin.buffer.read().split()));out=[]
for tc in range(1,data[0]+1) if data else []:
    k,a,b=data[3*tc-2:3*tc+1]
    out.append(f'Case {tc}: {prefix(k,b)-prefix(k,a-1)}')
sys.stdout.write('\n'.join(out))
