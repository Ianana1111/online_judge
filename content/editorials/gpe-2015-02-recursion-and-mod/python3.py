import sys
MOD=1000000009
for token in sys.stdin.buffer.read().split():
    n=int(token)
    print((pow(3,n,MOD)-2)%MOD)
