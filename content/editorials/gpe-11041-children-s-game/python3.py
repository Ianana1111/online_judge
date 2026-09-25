import functools
import sys

def compare(a, b):
    if a + b > b + a:
        return -1
    if a + b < b + a:
        return 1
    return 0

tokens = sys.stdin.buffer.read().split()
index = 0
while index < len(tokens):
    n = int(tokens[index])
    index += 1
    if n == 0:
        break
    values = tokens[index:index + n]
    index += n
    values.sort(key=functools.cmp_to_key(compare))
    sys.stdout.buffer.write(b''.join(values) + b'\n')
