import sys
data=sys.stdin.buffer.read().split();at=0;out=[]
while at<len(data) and data[at]!=b'0':
    n=int(data[at]);at+=1;board=['0']*(n*n);seen=set();winner=move=0
    for step in range(1,2*n+1):
        r=int(data[at]);c=int(data[at+1]);op=data[at+2];at+=3
        board[(r-1)*n+c-1]='1' if op==b'+' else '0'
        if winner:continue
        current=board[:];key=None
        for _ in range(4):
            text=''.join(current)
            if key is None or text<key:key=text
            rotated=['0']*(n*n)
            for row in range(n):
                for col in range(n):rotated[col*n+n-1-row]=current[row*n+col]
            current=rotated
        if key in seen:winner=2 if step%2 else 1;move=step
        seen.add(key)
    out.append(f'Player {winner} wins on move {move}' if winner else 'Draw')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
