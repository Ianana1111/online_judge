import sys
data=sys.stdin.buffer.read().split();out=[]
for s in data[1:] if data else []:
    n=len(s);palindrome=[bytearray(n) for _ in range(n)]
    for left in range(n-1,-1,-1):
        for right in range(left,n):
            palindrome[left][right]=(s[left]==s[right] and (right-left<2 or palindrome[left+1][right-1]))
    groups=[n+1]*(n+1);groups[0]=0
    for end in range(1,n+1):
        for begin in range(end):
            if palindrome[begin][end-1]:groups[end]=min(groups[end],groups[begin]+1)
    out.append(str(groups[n]))
sys.stdout.write('\n'.join(out))
