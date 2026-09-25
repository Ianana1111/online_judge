import sys
MOD=1000007
choose=[[1]]
for n in range(1,401):
    row=[1]*(n+1)
    previous=choose[-1]
    for k in range(1,n):row[k]=(previous[k-1]+previous[k])%MOD
    choose.append(row)
data=list(map(int,sys.stdin.buffer.read().split()))
out=[]
for tc in range(1,data[0]+1) if data else []:
    rows,cols,k=data[3*tc-2:3*tc+1]
    answer=0
    for mask in range(16):
        r=rows-bool(mask&1)-bool(mask&2)
        c=cols-bool(mask&4)-bool(mask&8)
        cells=r*c
        ways=choose[cells][k] if k<=cells else 0
        answer+=-ways if mask.bit_count()%2 else ways
    out.append(f'Case {tc}: {answer%MOD}')
sys.stdout.write('\n'.join(out))
