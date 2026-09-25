import sys
out=[]
for text in sys.stdin.buffer.read().split():
    joined=text[::-1]+b'#'+text
    prefix=[0]*len(joined)
    for i in range(1,len(joined)):
        length=prefix[i-1]
        while length and joined[i]!=joined[length]:
            length=prefix[length-1]
        if joined[i]==joined[length]:length+=1
        prefix[i]=length
    suffix=prefix[-1]
    out.append(text+text[:len(text)-suffix][::-1])
sys.stdout.buffer.write(b'\n'.join(out))
