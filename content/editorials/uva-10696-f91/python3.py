import sys

out = []
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    value = 91 if n <= 100 else n - 10
    out.append(f"f91({n}) = {value}")
sys.stdout.write("\n".join(out) + ("\n" if out else ""))
