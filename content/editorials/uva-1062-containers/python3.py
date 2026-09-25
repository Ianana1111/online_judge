import sys
from bisect import bisect_left
for case_number,sequence in enumerate(sys.stdin.buffer.read().split(),1):
    if sequence==b'end':
        break
    tops=[]
    for container in sequence:
        position=bisect_left(tops,container)
        if position==len(tops):
            tops.append(container)
        else:
            tops[position]=container
    print(f'Case {case_number}: {len(tops)}')
