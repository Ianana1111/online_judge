import sys


numbers = list(map(int, sys.stdin.buffer.read().split()))
answers = []
for index in range(0, len(numbers), 2):
    answers.append(str(2 * numbers[index] * numbers[index + 1]))
sys.stdout.write("\n".join(answers))
