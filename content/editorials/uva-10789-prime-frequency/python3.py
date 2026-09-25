import sys

prime = bytearray(b'\x01') * 2001
prime[0] = prime[1] = 0
for p in range(2, 45):
    if prime[p]:
        prime[p*p:2001:p] = b'\x00' * len(prime[p*p:2001:p])
tokens = sys.stdin.buffer.read().split()
if tokens:
    for case_number, word in enumerate(tokens[1:1 + int(tokens[0])], 1):
        count = [0] * 128
        for ch in word:
            count[ch] += 1
        answer = bytes(ch for ch in range(128) if prime[count[ch]])
        sys.stdout.buffer.write(f"Case {case_number}: ".encode() + (answer or b'empty') + b'\n')
