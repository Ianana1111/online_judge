import sys
first = sys.stdin.buffer.readline()
if first:
    for _ in range(int(first)):
        stack = []
        good = True
        for ch in sys.stdin.buffer.readline().strip():
            if ch in (40, 91):
                stack.append(ch)
            elif not stack or stack[-1] != (40 if ch == 41 else 91):
                good = False
                break
            else:
                stack.pop()
        print('Yes' if good and not stack else 'No')
