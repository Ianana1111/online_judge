import sys
data=sys.stdin.buffer.read().split();at=1;out=[]
for _ in range(int(data[0])) if data else []:
    length=int(data[at]);words=int(data[at+1]);at+=2
    previous=data[at];at+=1;answer=length
    for _ in range(words-1):
        current=data[at];at+=1
        overlap=length
        while overlap and previous[-overlap:]!=current[:overlap]:overlap-=1
        answer+=length-overlap;previous=current
    out.append(str(answer))
sys.stdout.write('\n'.join(out))
