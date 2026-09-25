import sys

days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    for case_number in range(values[0]):
        month = values[1 + 2 * case_number]
        day = values[2 + 2 * case_number]
        offset = sum(days[:month - 1]) + day - 1
        print(names[(5 + offset) % 7])
