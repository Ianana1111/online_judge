import sys
tokens=iter(sys.stdin.buffer.read().split())
for case_number in range(1,int(next(tokens))+1):
    digits=next(tokens)
    count=[0,0,0]
    residue=0
    for digit in digits:
        r=(digit-48)%3
        count[r]+=1
        residue=(residue+r)%3
    wins=count[residue]>0 and (count[0]-(residue==0))%2==0
    print(f'Case {case_number}: {"S" if wins else "T"}')
