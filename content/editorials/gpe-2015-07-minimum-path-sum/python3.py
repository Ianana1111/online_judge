import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for _ in range(next(values)):
    rows,cols=next(values),next(values)
    dp=[0]*cols
    for r in range(rows):
        for c in range(cols):
            value=next(values)
            if r==c==0:
                dp[c]=value
            elif r==0:
                dp[c]=dp[c-1]+value
            elif c==0:
                dp[c]+=value
            else:
                dp[c]=min(dp[c],dp[c-1])+value
    print(dp[-1])
