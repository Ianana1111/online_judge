import sys
lines=sys.stdin.buffer.read().splitlines();at=1;blocks=[]
for _ in range(int(lines[0])) if lines else []:
    while at<len(lines) and not lines[at].strip():at+=1
    n=int(lines[at]);at+=1
    names=[lines[at+i].decode().rstrip('\r') for i in range(n)];at+=n
    ballots=[]
    while at<len(lines) and lines[at].strip():
        ballots.append([int(x)-1 for x in lines[at].split()]);at+=1
    alive=[True]*n
    while True:
        votes=[0]*n
        for ballot in ballots:
            for id in ballot:
                if alive[id]:votes[id]+=1;break
        current=[votes[i] for i in range(n) if alive[i]]
        least=min(current);most=max(current)
        if 2*most>len(ballots):winners=[i for i in range(n) if alive[i] and votes[i]==most];break
        if least==most:winners=[i for i in range(n) if alive[i]];break
        for i in range(n):
            if alive[i] and votes[i]==least:alive[i]=False
    blocks.append('\n'.join(names[i] for i in winners))
sys.stdout.write('\n\n'.join(blocks)+'\n' if blocks else '')
