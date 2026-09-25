import sys


values = list(map(int, sys.stdin.buffer.read().split()))
index = 0
case_number = 0
while index < len(values):
    count = values[index]
    index += 1
    if count == 0:
        break
    heights = values[index:index + count]
    index += count
    target = sum(heights) // count
    moves = sum(height - target for height in heights if height > target)
    case_number += 1
    print(f"Set #{case_number}\nThe minimum number of moves is {moves}.\n")
