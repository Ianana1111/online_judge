import sys
data=sys.stdin.buffer.read().split();at=1;out=[]
for _ in range(int(data[0])) if data else []:
    k=int(data[at]);at+=1
    first=data[at:at+6];at+=6;second=data[at:at+6];at+=6
    choices=[]
    for col in range(5):
        a={row[col] for row in first};b={row[col] for row in second}
        choices.append(sorted(a&b))
    suffix=[1]*6
    for col in range(4,-1,-1):suffix[col]=suffix[col+1]*len(choices[col])
    if k>suffix[0]:out.append('NO');continue
    rank=k-1;answer=bytearray()
    for col in range(5):
        index,rank=divmod(rank,suffix[col+1]);answer.append(choices[col][index])
    out.append(answer.decode())
sys.stdout.write('\n'.join(out))
