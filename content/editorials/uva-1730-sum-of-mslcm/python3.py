import sys
out=[]
for token in sys.stdin.buffer.read().split():
    n=int(token)
    if n==0:break
    answer=0;left=1
    while left<=n:
        quotient=n//left;right=n//quotient
        answer+=(left+right)*(right-left+1)//2*quotient
        left=right+1
    out.append(str(answer-1))
sys.stdout.write('\n'.join(out))
