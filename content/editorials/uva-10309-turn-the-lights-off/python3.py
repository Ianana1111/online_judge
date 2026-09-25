import sys
data=sys.stdin.buffer.read().split();at=0;out=[]
while at<len(data):
    name=data[at];at+=1
    if name==b'end':break
    lights=[]
    for _ in range(10):
        row=data[at];at+=1
        lights.append(sum(1<<c for c,ch in enumerate(row) if ch==79))
    best=101
    for first in range(1024):
        previous=0;press=first;count=0
        for row in lights:
            count+=press.bit_count()
            next_press=row^press^((press<<1)&1023)^(press>>1)^previous
            previous,press=press,next_press
        if press==0 and count<best:best=count
    out.append(f'{name.decode()} {best if best<=100 else -1}')
sys.stdout.write('\n'.join(out))
