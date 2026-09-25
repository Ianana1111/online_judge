import sys
MOD=1000007
data=sys.stdin.buffer.read().split();at=1;out=[]
for tc in range(1,int(data[0])+1) if data else []:
    n=int(data[at]);at+=1
    board=data[at:at+n];at+=n
    ways=[[int(ch==87) for ch in row] for row in board]
    for r in range(n-1,0,-1):
        for c in range(n):
            count=ways[r][c]
            if count==0:continue
            for direction in (-1,1):
                nr=r-1;nc=c+direction
                if nc<0 or nc>=n:continue
                if board[nr][nc]==66:nr-=1;nc+=direction
                if nr<0 or nc<0 or nc>=n or board[nr][nc]==66:continue
                ways[nr][nc]=(ways[nr][nc]+count)%MOD
    out.append(f'Case {tc}: {sum(ways[0])%MOD}')
sys.stdout.write('\n'.join(out))
