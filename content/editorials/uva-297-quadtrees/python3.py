import sys
data=sys.stdin.buffer.read().split();out=[]
for tc in range(int(data[0])) if data else []:
    first=data[2*tc+1];second=data[2*tc+2];black=bytearray(1024)
    def paint(tree,position,row,col,side):
        kind=tree[position];position+=1
        if kind==102:
            for r in range(row,row+side):
                start=r*32+col
                black[start:start+side]=b'\x01'*side
        elif kind==112:
            half=side//2
            for nr,nc in ((row,col+half),(row,col),(row+half,col),(row+half,col+half)):
                position=paint(tree,position,nr,nc,half)
        return position
    paint(first,0,0,0,32);paint(second,0,0,0,32)
    out.append(f'There are {sum(black)} black pixels.')
sys.stdout.write('\n'.join(out))
