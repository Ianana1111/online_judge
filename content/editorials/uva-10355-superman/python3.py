import math
import sys
data=sys.stdin.buffer.read().split();at=0;out=[]
while at<len(data):
    city=data[at].decode();at+=1
    start=list(map(int,data[at:at+3]));at+=3
    finish=list(map(int,data[at:at+3]));at+=3
    direction=[finish[i]-start[i] for i in range(3)]
    a=sum(value*value for value in direction)
    n=int(data[at]);at+=1;fraction=0.0
    for _ in range(n):
        center=list(map(int,data[at:at+3]));radius=int(data[at+3]);at+=4
        offset=[start[i]-center[i] for i in range(3)]
        b=sum(offset[i]*direction[i] for i in range(3))
        c=sum(value*value for value in offset)-radius*radius
        discriminant=b*b-a*c
        if discriminant<=0:continue
        root=math.sqrt(discriminant);enter=(-b-root)/a;leave=(-b+root)/a
        fraction+=max(0.0,min(1.0,leave)-max(0.0,enter))
    out.append(city);out.append(f'{100*fraction:.2f}')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
