import sys
tokens=sys.stdin.buffer.read().split();out=[]
for case,trend in enumerate(tokens[1:],1):
    n=len(trend);height=0;rows={}
    for x,ch in enumerate(trend):
        if ch==ord('F'):height-=1
        rows.setdefault(height,[' ']*n)[x]='/' if ch==ord('R') else '\\' if ch==ord('F') else '_'
        if ch==ord('R'):height+=1
    out.append(f'Case #{case}:')
    for y in range(max(rows),min(rows)-1,-1):out.append('| '+''.join(rows.get(y,[' ']*n)).rstrip())
    out.extend(['+'+'-'*(n+2),''])
sys.stdout.write('\n'.join(out)+'\n' if out else '')
