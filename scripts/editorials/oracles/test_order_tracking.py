import itertools,random,unittest
from fractions import Fraction
from order_tracking import grade,play_spot,coverage,choose_stamps,sheet_locations,exact_power,circular_values,trial_prime
class OrderTrackingTests(unittest.TestCase):
 def test_ranking_against_all_event_subsets(self):
  rng=random.Random(111)
  for n in range(2,9):
   for _ in range(80):
    correct=list(range(1,n+1));response=correct[:];rng.shuffle(correct);rng.shuffle(response);best=0
    for mask in range(1<<n):
     events=[i for i in range(n) if mask>>i&1]
     if sorted(events,key=correct.__getitem__)==sorted(events,key=response.__getitem__):best=max(best,len(events))
    self.assertEqual(grade(correct,response),best)
 def test_spot_rotations_initial_position_and_first_loss(self):
  self.assertEqual(play_spot(2,[(0,0,'+'),(0,0,'-'),(1,1,'+'),(1,1,'-')]),'Player 2 wins on move 3')
  self.assertEqual(play_spot(3,[(0,0,'+'),(0,0,'-'),(1,1,'+'),(1,1,'-'),(0,1,'+'),(1,2,'+')]),'Player 1 wins on move 4')
  rng=random.Random(141)
  def matrix(n,moves):
   board=[[0]*n for _ in range(n)];past=[];answer='Draw'
   for turn,(r,c,op) in enumerate(moves,1):
    board[r][c]=int(op=='+')
    if answer!='Draw':continue
    rot=board
    for _ in range(4):
     if rot in past:answer=f'Player {2 if turn%2 else 1} wins on move {turn}'
     rot=[list(row) for row in zip(*rot[::-1])]
    past.append([row[:] for row in board])
   return answer
  for n in [2,3,5,10]:
   for _ in range(100):
    board=set();moves=[]
    for j in range(2*n):
     point=(rng.randrange(n),rng.randrange(n));op='-' if point in board else '+'
     if op=='+':board.add(point)
     else:board.remove(point)
     moves.append((*point,op))
    self.assertEqual(play_spot(n,moves),matrix(n,moves))
 def test_stamp_bitset_against_coin_multisets(self):
  for s in range(1,6):
   for k in range(1,min(s,4)+1):
    for row in itertools.combinations(range(1,8),k):
     reachable={0}
     for used in range(1,s+1):reachable.update(map(sum,itertools.combinations_with_replacement(row,used)))
     end=0
     while end+1 in reachable:end+=1
     self.assertEqual(coverage(s,row),end)
  self.assertEqual(choose_stamps(5,[[1,2,3],[1,3]]),[1,2,3])
 def test_sheet_against_per_origin_forward_tracking(self):
  rng=random.Random(512)
  for _ in range(100):
   initial=5;r=c=initial;ops=[]
   for turn in range(20):
    command=rng.choice(['EX','IR','IC','DR','DC'])
    if command=='EX':values=[rng.randint(1,r),rng.randint(1,c),rng.randint(1,r),rng.randint(1,c)]
    else:
     dim=r if command[1]=='R' else c
     if command[0]=='D' and dim==1:continue
     values=rng.sample(range(1,dim+1),min(2,dim-(command[0]=='D')))
     if command[1]=='R':r+=len(values) if command[0]=='I' else -len(values)
     else:c+=len(values) if command[0]=='I' else -len(values)
    ops.append((command,values))
   result=sheet_locations(initial,initial,ops)
   for origin in itertools.product(range(1,initial+1),repeat=2):
    rr,cc=origin;alive=True
    for command,values in ops:
     if command=='EX':
      a,b,x,y=values
      if (rr,cc)==(a,b):rr,cc=x,y
      elif (rr,cc)==(x,y):rr,cc=a,b
     else:
      coordinate=rr if command[1]=='R' else cc
      if command[0]=='D' and coordinate in values:alive=False;break
      shift=sum(v<=coordinate for v in values) if command[0]=='I' else -sum(v<coordinate for v in values)
      if command[1]=='R':rr+=shift
      else:cc+=shift
    self.assertEqual(result.get(origin),(rr,cc) if alive else None)
 def test_grade_school_decimal_against_exact_fractions(self):
  rng=random.Random(748)
  for _ in range(300):
   token=f'{rng.randrange(1,999990):06d}';token=token[:2]+'.'+token[2:];n=rng.randint(1,25);text=exact_power(token,n);self.assertEqual(Fraction(text),Fraction(token)**n);self.assertFalse(text.startswith('0'));self.assertFalse('.' in text and text.endswith('0'))
  self.assertEqual(exact_power('10.000',25),'1'+'0'*25);self.assertEqual(exact_power('0.1000',2),'.01')
 def test_circular_candidates_against_exhaustive_trial_primes(self):
  expected=[]
  for n in range(100,10000):
   word=str(n)
   if all(trial_prime(int(word[i:]+word[:i])) for i in range(len(word))):expected.append(n)
  self.assertEqual([n for n in circular_values() if n<10000],expected);self.assertEqual(len(circular_values()),42)
if __name__=='__main__':unittest.main()
