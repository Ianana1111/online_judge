import sys
data=sys.stdin.buffer.read().split();out=[]
for s in data[1:] if data else []:
    n=len(s);i=0;j=1;k=0
    while i<n and j<n and k<n:
        a=s[(i+k)%n];b=s[(j+k)%n]
        if a==b:k+=1;continue
        if a>b:
            i+=k+1
            if i==j:i+=1
        else:
            j+=k+1
            if i==j:j+=1
        k=0
    out.append(str(min(i,j)+1))
sys.stdout.write('\n'.join(out))
