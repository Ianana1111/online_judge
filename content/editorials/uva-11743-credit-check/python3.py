import sys

tokens = sys.stdin.buffer.read().split()
if tokens:
    for case_number in range(int(tokens[0])):
        start = 1 + 4*case_number
        digits = b''.join(tokens[start:start+4])
        total = 0
        for i, ch in enumerate(digits):
            value = ch - ord('0')
            if i % 2 == 0:
                value *= 2
                if value > 9:
                    value -= 9
            total += value
        print('Valid' if total % 10 == 0 else 'Invalid')
