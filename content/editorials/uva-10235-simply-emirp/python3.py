import sys
def prime(n):
    if n<2:
        return False
    divisor=2
    while divisor*divisor<=n:
        if n%divisor==0:
            return False
        divisor+=1
    return True
for token in sys.stdin.buffer.read().split():
    n=int(token)
    reversed_number=int(token[::-1])
    kind='not prime' if not prime(n) else 'emirp' if reversed_number!=n and prime(reversed_number) else 'prime'
    print(f'{n} is {kind}.')
