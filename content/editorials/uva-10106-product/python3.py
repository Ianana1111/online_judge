import sys
data=sys.stdin.buffer.read().split();out=[]
for i in range(0,len(data),2):
    a=data[i];b=data[i+1]
    digits=[0]*(len(a)+len(b))
    for x in range(len(a)-1,-1,-1):
        for y in range(len(b)-1,-1,-1):
            digits[x+y+1]+=(a[x]-48)*(b[y]-48)
    for x in range(len(digits)-1,0,-1):
        digits[x-1]+=digits[x]//10;digits[x]%=10
    first=0
    while first+1<len(digits) and digits[first]==0:first+=1
    out.append(''.join(map(str,digits[first:])))
sys.stdout.write('\n'.join(out))
