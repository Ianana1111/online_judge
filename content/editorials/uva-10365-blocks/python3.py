import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    for blocks in values[1:1 + values[0]]:
        answer = 6 * blocks
        a = 1
        while a * a * a <= blocks:
            if blocks % a == 0:
                b = a
                while b * b <= blocks // a:
                    if (blocks // a) % b == 0:
                        c = blocks // a // b
                        answer = min(answer, 2 * (a*b + b*c + c*a))
                    b += 1
            a += 1
        print(answer)
