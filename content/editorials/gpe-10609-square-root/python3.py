import sys

def exact_root(value):
    root = 1 << ((value.bit_length() + 1) // 2)
    while True:
        following = (root + value // root) // 2
        if following >= root:
            break
        root = following
    return root

tokens = sys.stdin.buffer.read().split()
tests = int(tokens[0])
answers = [str(exact_root(int(value))) for value in tokens[1:tests + 1]]
sys.stdout.write("\n\n".join(answers) + ("\n" if answers else ""))
