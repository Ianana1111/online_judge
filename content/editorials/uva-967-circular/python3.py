import sys
limit=1000000;prime=bytearray(b'\x01')*limit;prime[0]=prime[1]=0
for p in range(2,1000):
    if prime[p]:prime[p*p:limit:p]=b'\x00'*(((limit-1-p*p)//p)+1)
prefix=[0]*limit
for value in range(100,limit):
    good=prime[value];power=1;length=1;rest=value
    while rest>=10:power*=10;length+=1;rest//=10
    rotated=value
    for _ in range(1,length):
        if not good:break
        rotated=(rotated%power)*10+rotated//power
        if not prime[rotated]:good=0
    prefix[value]=prefix[value-1]+good
data=list(map(int,sys.stdin.buffer.read().split()));out=[]
for at in range(0,len(data),2):
    left=data[at]
    if left==-1:break
    right=data[at+1];count=prefix[right]-prefix[left-1]
    out.append('No Circular Primes.' if count==0 else '1 Circular Prime.' if count==1 else f'{count} Circular Primes.')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
