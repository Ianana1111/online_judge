import sys
data=sys.stdin.buffer.read().split();at=0;out=[]
if data:
    tests=int(data[at]);at+=1
    for _ in range(tests):
        n=int(data[at]);k=int(data[at+1]);at+=2
        side=[];results=[]
        for _ in range(k):
            count=int(data[at]);at+=1;row=[0]*(n+1)
            for coin in data[at:at+count]:row[int(coin)]=1
            at+=count
            for coin in data[at:at+count]:row[int(coin)]=-1
            at+=count
            symbol=data[at];at+=1
            results.append(-1 if symbol==b'<' else 1 if symbol==b'>' else 0)
            side.append(row)
        candidates=[]
        for coin in range(1,n+1):
            if any(all(side[j][coin]*direction==results[j] for j in range(k)) for direction in (-1,1)):
                candidates.append(coin)
        out.append(str(candidates[0] if len(candidates)==1 else 0))
sys.stdout.write('\n\n'.join(out)+'\n' if out else '')
