import sys
tokens=(word for line in sys.stdin.buffer for word in line.split());blocks=[]
for first in tokens:
    n=int(first)
    if n==0:break
    k=int(next(tokens));wins=[0]*n;losses=[0]*n
    for _ in range(k*n*(n-1)//2):
        a=int(next(tokens))-1;x=next(tokens)
        b=int(next(tokens))-1;y=next(tokens)
        if x==y:continue
        win=(x==b'rock' and y==b'scissors') or (x==b'scissors' and y==b'paper') or (x==b'paper' and y==b'rock')
        if win:wins[a]+=1;losses[b]+=1
        else:wins[b]+=1;losses[a]+=1
    lines=[]
    for win,loss in zip(wins,losses):
        played=win+loss
        if not played:lines.append('-')
        else:
            value=(2*win*1000+played)//(2*played)
            lines.append(f'{value//1000}.{value%1000:03d}')
    blocks.append('\n'.join(lines))
sys.stdout.write('\n\n'.join(blocks))
