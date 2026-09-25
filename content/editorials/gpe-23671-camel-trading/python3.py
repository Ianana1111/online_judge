import sys
lines = sys.stdin.buffer.read().splitlines()
if not lines:
    sys.exit()
tests = int(lines[0])
out = []
position = 1
for _ in range(tests):
    while position < len(lines) and not lines[position].strip():
        position += 1
    line = lines[position].decode()
    position += 1
    values = []
    ops = []
    number = ''
    for ch in line:
        if ch.isdigit():
            number += ch
        elif ch in '+*':
            values.append(int(number))
            number = ''
            ops.append(ch)
    values.append(int(number))
    def evaluate(first):
        answer = 1 if first == '+' else 0
        group = values[0]
        for op, value in zip(ops, values[1:]):
            if op == first:
                group = group + value if first == '+' else group * value
            else:
                answer = answer * group if first == '+' else answer + group
                group = value
        return answer * group if first == '+' else answer + group
    out.append(f'The maximum and minimum are {evaluate("+")} and {evaluate("*")}.')
sys.stdout.write('\n'.join(out))
