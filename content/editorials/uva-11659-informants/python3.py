import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n,a=data[at:at+2];at+=2
    if n==0 and a==0:break
    positive=[0]*n;negative=[0]*n
    for _ in range(a):
        speaker,target=data[at:at+2];at+=2;speaker-=1
        if target>0:positive[speaker]|=1<<(target-1)
        else:negative[speaker]|=1<<(-target-1)
    best=0
    for mask in range(1<<n):
        count=bin(mask).count("1")
        if count<=best:continue
        selected=mask;valid=True
        while selected:
            bit=selected&-selected;speaker=bit.bit_length()-1
            if positive[speaker]&mask!=positive[speaker] or negative[speaker]&mask:
                valid=False;break
            selected-=bit
        if valid:best=count
        if best==n:break
    out.append(str(best))
sys.stdout.write('\n'.join(out))
