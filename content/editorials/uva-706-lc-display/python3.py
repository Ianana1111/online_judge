import sys
mask=(0x3f,0x06,0x5b,0x4f,0x66,0x6d,0x7d,0x07,0x7f,0x6f)
data=sys.stdin.buffer.read().split();at=0;out=[]
while at<len(data):
    size=int(data[at]);number=data[at+1];at+=2
    if size==0 and number==b'0':break
    for row in range(2*size+3):
        parts=[]
        for ch in number:
            segments=mask[ch-48]
            if row in (0,size+1,2*size+2):
                bit=0 if row==0 else 6 if row==size+1 else 3
                parts.append(' '+('-' if segments&(1<<bit) else ' ')*size+' ')
            else:
                upper=row<size+1;left=5 if upper else 4;right=1 if upper else 2
                parts.append(('|' if segments&(1<<left) else ' ')+' '*size+('|' if segments&(1<<right) else ' '))
        out.append(' '.join(parts))
    out.append('')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
