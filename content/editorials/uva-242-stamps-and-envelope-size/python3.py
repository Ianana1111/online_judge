import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
def coverage(limit,stamps):
    maximum=limit*stamps[-1];dp=[limit+1]*(maximum+1);dp[0]=0
    for amount in range(1,maximum+1):
        for coin in stamps:
            if coin<=amount:dp[amount]=min(dp[amount],dp[amount-coin]+1)
        if dp[amount]>limit:return amount-1
    return maximum
while at<len(data) and data[at]:
    limit,n=data[at:at+2];at+=2;best_coverage=-1;best=[]
    for _ in range(n):
        count=data[at];at+=1;candidate=data[at:at+count];at+=count
        covered=coverage(limit,candidate)
        if (covered>best_coverage or
            covered==best_coverage and (len(candidate)<len(best) or
            len(candidate)==len(best) and tuple(reversed(candidate))<tuple(reversed(best)))):
            best_coverage=covered;best=candidate
    out.append(f'max coverage ={best_coverage:4d} :'+''.join(f'{coin:3d}' for coin in best))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
