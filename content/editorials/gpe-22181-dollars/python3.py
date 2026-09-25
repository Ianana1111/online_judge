import sys
ways=[0]*6001;ways[0]=1
for coin in (1,2,4,10,20,40,100,200,400,1000,2000):
    for total in range(coin,6001):ways[total]+=ways[total-coin]
out=[]
for token in sys.stdin.buffer.read().split():
    whole,dot,fraction=token.partition(b'.')
    cents=int(whole or b'0')*100+int((fraction+b'00')[:2]) if dot else int(token)*100
    if cents==0:break
    amount=f'{cents//100}.{cents%100:02d}'
    out.append(f'{amount:>6}{ways[cents//5]:>17}')
sys.stdout.write('\n'.join(out))
