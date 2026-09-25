import sys
tokens=iter(sys.stdin.buffer.read().split())
outputs=[]
for _ in range(int(next(tokens))):
    n=int(next(tokens))
    board=[next(tokens) for _ in range(n)]
    touch=[next(tokens) for _ in range(n)]
    lost=any(board[r][c]==42 and touch[r][c]==120 for r in range(n) for c in range(n))
    rows=[]
    for r in range(n):
        line=[]
        for c in range(n):
            if lost and board[r][c]==42:
                line.append('*')
            elif touch[r][c]!=120:
                line.append('.')
            else:
                count=sum(0<=r+dr<n and 0<=c+dc<n and board[r+dr][c+dc]==42
                          for dr in (-1,0,1) for dc in (-1,0,1) if dr or dc)
                line.append(str(count))
        rows.append(''.join(line))
    outputs.append('\n'.join(rows))
print('\n\n'.join(outputs))
