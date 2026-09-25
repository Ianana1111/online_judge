import sys
for token in sys.stdin.buffer.read().split():
    value=int(token)
    if value==0:
        break
    bits=bin(value)[2:]
    print(f'The parity of {bits} is {bits.count("1")} (mod 2).')
