import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    card=[[0]*5 for _ in range(5)]
    for r in range(5):
        for c in range(5):
            if (r,c)!=(2,2):
                card[r][c]=next(values)
    called=[0]*76
    for time in range(1,76):
        called[next(values)]=time
    answer=75
    for r in range(5):
        answer=min(answer,max(called[card[r][c]] for c in range(5)),
                   max(called[card[c][r]] for c in range(5)))
    answer=min(answer,max(called[card[r][r]] for r in range(5)),
               max(called[card[r][4-r]] for r in range(5)))
    print(f'BINGO after {answer} numbers announced')
