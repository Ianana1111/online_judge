from array import array
from collections import defaultdict
import sys

data=list(map(int,sys.stdin.buffer.read().split()))
groups=defaultdict(list)
for index in range(data[0]) if data else []:
    remaining,ones,fives,tens=data[1+4*index:5+4*index]
    groups[remaining,ones+5*fives+10*tens].append((index,fives,tens))
out=['']*(data[0] if data else 0)

for (total_c,total_value),cases in groups.items():
    max_five=max(five+ten for _,five,ten in cases)
    max_ten=max(ten for _,_,ten in cases)
    five_width=max_five+1
    ten_width=max_ten+1
    memo=array('i',[-1])*((total_c+1)*five_width*ten_width)

    def solve(remaining,fives,tens):
        if remaining==0:return 0
        key=(remaining*five_width+fives)*ten_width+tens
        saved=memo[key]
        if saved>=0:return saved
        ones=total_value-8*(total_c-remaining)-5*fives-10*tens
        answer=1000000
        if ones>=8:
            candidate=8+solve(remaining-1,fives,tens)
            if candidate<answer:answer=candidate
        if fives>=1 and ones>=3:
            candidate=4+solve(remaining-1,fives-1,tens)
            if candidate<answer:answer=candidate
        if fives>=2:
            candidate=2+solve(remaining-1,fives-2,tens)
            if candidate<answer:answer=candidate
        if tens>=1:
            candidate=1+solve(remaining-1,fives,tens-1)
            if candidate<answer:answer=candidate
        if tens>=1 and ones>=3:
            candidate=4+solve(remaining-1,fives+1,tens-1)
            if candidate<answer:answer=candidate
        memo[key]=answer
        return answer

    for index,fives,tens in cases:
        out[index]=str(solve(total_c,fives,tens))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
