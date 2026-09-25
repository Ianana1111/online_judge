import sys
tokens=iter(sys.stdin.buffer.read().split())
budget=5000000
for _ in range(int(next(tokens))):
    prices=[]
    for token in tokens:
        if token==b'0':
            break
        price=0
        for digit in token:
            price=min(budget+1,price*10+digit-48)
        prices.append(price)
    prices.sort(reverse=True)
    total=0
    expensive=False
    for i,price in enumerate(prices):
        power=1
        for _ in range(i+1):
            if power>budget//2//price:
                expensive=True
                break
            power*=price
        if expensive or total+2*power>budget:
            expensive=True
            break
        total+=2*power
    print('Too expensive' if expensive else total)
