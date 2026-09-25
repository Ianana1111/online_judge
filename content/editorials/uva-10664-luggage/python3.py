import sys
first=sys.stdin.buffer.readline()
if first:
    for _ in range(int(first)):
        weights=list(map(int,sys.stdin.buffer.readline().split()))
        total=sum(weights)
        if total%2:
            print('NO')
            continue
        target=total//2
        reachable=bytearray(target+1)
        reachable[0]=1
        for weight in weights:
            for amount in range(target,weight-1,-1):
                if reachable[amount-weight]:
                    reachable[amount]=1
        print('YES' if reachable[target] else 'NO')
