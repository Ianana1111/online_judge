import sys
tokens=iter(sys.stdin.buffer.read().split())
for case_number in range(1,int(next(tokens))+1):
    next(tokens)
    next(tokens)
    n=int(next(tokens))
    values=[int(next(tokens)) for _ in range(n*n)]
    good=all(value>=0 for value in values) and values==values[::-1]
    print(f'Test #{case_number}: {"Symmetric." if good else "Non-symmetric."}')
