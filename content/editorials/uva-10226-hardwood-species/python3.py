import sys
from collections import Counter
lines=iter(sys.stdin.buffer.read().splitlines())
tests=int(next(lines))
for case_number in range(tests):
    counts=Counter()
    total=0
    for line in lines:
        line=line.rstrip(b'\r')
        if not line:
            if total:
                break
            continue
        counts[line]+=1
        total+=1
    if case_number:
        sys.stdout.buffer.write(b'\n')
    for name in sorted(counts):
        scaled=(counts[name]*1000000+total//2)//total
        sys.stdout.buffer.write(name+f' {scaled//10000}.{scaled%10000:04d}\n'.encode())
