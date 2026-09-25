import sys
from array import array
for line in sys.stdin.buffer:
    s=line.rstrip(b'\r\n')
    if s==b'.':
        break
    n=len(s)
    prefix=array('I',[0])*n
    for i in range(1,n):
        length=prefix[i-1]
        while length and s[i]!=s[length]:
            length=prefix[length-1]
        if s[i]==s[length]:
            length+=1
        prefix[i]=length
    period=n-prefix[-1]
    print(n//period if n%period==0 else 1)
