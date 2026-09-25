import sys
xs=[0]*100000;ys=[0]*100000
directions=((-1,1),(-1,0),(0,-1),(1,-1),(1,0),(0,1))
label=1;x=y=0;ring=1
while label<99999:
    y+=1;label+=1
    if label<=99999:xs[label],ys[label]=x,y
    for d,(dx,dy) in enumerate(directions):
        for _ in range(ring-1 if d==0 else ring):
            x+=dx;y+=dy;label+=1
            if label<=99999:xs[label],ys[label]=x,y
    ring+=1
out=[]
for token in sys.stdin.buffer.read().split():
    n=int(token);out.append(f'{xs[n]} {ys[n]}')
sys.stdout.write('\n'.join(out))
