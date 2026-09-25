import sys
limit=10000000;prime=bytearray(b'\x01')*limit;prime[0]=prime[1]=0
for p in range(2,3163):
    if prime[p]:prime[p*p:limit:p]=b'\x00'*(((limit-1-p*p)//p)+1)
data=sys.stdin.buffer.read().split();out=[]
for digits in data[1:] if data else []:
    remaining=[0]*10
    for digit in digits:remaining[digit-48]+=1
    answer=0;length=len(digits)
    def search(value,used):
        global answer
        if prime[value]:answer+=1
        if used==length:return
        for digit in range(10):
            if remaining[digit] and (used or digit):
                remaining[digit]-=1;search(value*10+digit,used+1);remaining[digit]+=1
    search(0,0);out.append(str(answer))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
