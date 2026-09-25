import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
game=0
for n in values:
    if n==0:
        break
    secret=[next(values) for _ in range(n)]
    frequency=[secret.count(digit) for digit in range(10)]
    game+=1
    print(f'Game {game}:')
    while True:
        guess=[next(values) for _ in range(n)]
        if guess[0]==0:
            break
        strong=sum(a==b for a,b in zip(secret,guess))
        total=sum(min(frequency[digit],guess.count(digit)) for digit in range(1,10))
        print(f'    ({strong},{total-strong})')
