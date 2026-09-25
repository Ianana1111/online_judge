import sys
tokens=iter(sys.stdin.buffer.read().split())
for _ in range(int(next(tokens))):
    rows,cols,queries=int(next(tokens)),int(next(tokens)),int(next(tokens))
    grid=[next(tokens) for _ in range(rows)]
    print(rows,cols,queries)
    for _ in range(queries):
        r,c=int(next(tokens)),int(next(tokens))
        limit=min(r,c,rows-1-r,cols-1-c)
        radius=0
        for new_radius in range(1,limit+1):
            if any(grid[r-new_radius][c+offset]!=grid[r][c] or grid[r+new_radius][c+offset]!=grid[r][c] or
                   grid[r+offset][c-new_radius]!=grid[r][c] or grid[r+offset][c+new_radius]!=grid[r][c]
                   for offset in range(-new_radius,new_radius+1)):
                break
            radius=new_radius
        print(2*radius+1)
