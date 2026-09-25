import sys
count = [[0] * 352 for _ in range(27)]
count[0][0] = 1
for value in range(1, 27):
    for length in range(26, 0, -1):
        for total in range(351, value - 1, -1):
            count[length][total] += count[length - 1][total - value]
data = list(map(int, sys.stdin.buffer.read().split()))
out = []
case_no = 0
for i in range(0, len(data) - 1, 2):
    length, total = data[i], data[i + 1]
    if length == 0 and total == 0:
        break
    case_no += 1
    answer = count[length][total] if length <= 26 and total <= 351 else 0
    out.append(f'Case {case_no}: {answer}')
sys.stdout.write('\n'.join(out))
