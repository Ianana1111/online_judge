import sys
tokens = iter(sys.stdin.buffer.read().split())
for case_number in range(1, int(next(tokens)) + 1):
    days = {}
    for _ in range(int(next(tokens))):
        subject = next(tokens)
        days[subject] = int(next(tokens))
    deadline, wanted = int(next(tokens)), next(tokens)
    finish = days.get(wanted, 10**9)
    result = 'Yesss' if finish <= deadline else 'Late' if finish <= deadline + 5 else 'Do your own homework!'
    print(f'Case {case_number}: {result}')
