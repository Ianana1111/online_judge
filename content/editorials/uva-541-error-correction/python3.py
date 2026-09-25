import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for n in values:
    if n==0:
        break
    rows=[0]*n
    columns=[0]*n
    for r in range(n):
        for c in range(n):
            bit=next(values)
            rows[r]^=bit
            columns[c]^=bit
    odd_rows=[i+1 for i,value in enumerate(rows) if value]
    odd_columns=[i+1 for i,value in enumerate(columns) if value]
    if not odd_rows and not odd_columns:
        print('OK')
    elif len(odd_rows)==len(odd_columns)==1:
        print(f'Change bit ({odd_rows[0]},{odd_columns[0]})')
    else:
        print('Corrupt')
