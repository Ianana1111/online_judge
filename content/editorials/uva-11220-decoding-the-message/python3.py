import sys
lines=iter(sys.stdin.buffer.read().splitlines())
tests=int(next(lines))
for case_number in range(1,tests+1):
    if case_number>1:
        sys.stdout.buffer.write(b'\n')
    sys.stdout.buffer.write(f'Case #{case_number}:\n'.encode())
    started=False
    for line in lines:
        decoded=bytearray()
        for word in line.split():
            if len(word)>len(decoded):
                decoded.append(word[len(decoded)])
        if not decoded:
            if started:
                break
            continue
        started=True
        sys.stdout.buffer.write(decoded+b'\n')
