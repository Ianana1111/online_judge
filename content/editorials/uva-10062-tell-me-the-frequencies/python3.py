import sys
first=True
for line in sys.stdin.buffer:
    count=[0]*128
    for ch in line.rstrip(b'\r\n'):
        if ch<128:
            count[ch]+=1
    if not first:
        print()
    first=False
    for code in sorted((ch for ch in range(32,128) if count[ch]),key=lambda ch:(count[ch],-ch)):
        print(code,count[code])
