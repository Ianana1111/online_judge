import itertools,math,random,unittest
from carry_boxes import divisibility,format_cases,brute_box,MOD

def answers(cases):
 values=[]
 for i in range(0,len(cases),50):values.extend(int(line.split(': ')[1]) for line in divisibility(format_cases(cases[i:i+50])).splitlines())
 return values
class CarryBoxTests(unittest.TestCase):
 def test_all_small_rectangles_against_factorial_valuations(self):
  intervals=[(a,b) for a in range(4) for b in range(a,5)];cases=[]
  for p in [2,3,5,7]:
   for n in [1,2]:
    for ranges in itertools.product(intervals,repeat=n):cases.append((n,p,[r[0] for r in ranges],[r[1] for r in ranges]))
  self.assertEqual(answers(cases),[brute_box(p,lo,hi) for n,p,lo,hi in cases])
 def test_random_high_dimensional_shifted_narrow_boxes(self):
  rng=random.Random(10615);cases=[]
  for n in range(3,8):
   for _ in range(15):
    p=rng.choice([2,3,5,7,11,13,17,19]);lo=[rng.randrange(10**14) for _ in range(n)];hi=[x+rng.randrange(3) for x in lo];cases.append((n,p,lo,hi))
  self.assertEqual(answers(cases),[brute_box(p,lo,hi) for n,p,lo,hi in cases])
 def test_full_digit_cubes_closed_form_and_zero_origin(self):
  cases=[];wanted=[]
  for p in [2,3,5,7,11,13,17,19]:
   for n in range(1,8):
    for d in [0,1,3,8]:
     if p**d>10**15:continue
     cases.append((n,p,[0]*n,[p**d-1]*n));wanted.append(pow(math.comb(p-1+n,n),d,MOD))
  self.assertEqual(answers(cases),wanted)
 def test_pascal_grid_recurrence_and_valuation_agree(self):
  from carry_boxes import factorial_valuation
  for n in [1,2,3,4]:
   grid={}
   for x in itertools.product(range(5),repeat=n):grid[x]=1 if sum(x)==0 else sum(grid.get(x[:i]+(x[i]-1,)+x[i+1:],0) for i in range(n))
   for p in [2,3,5,7,11,19]:
    self.assertEqual(sum(v%p!=0 for v in grid.values()),sum(factorial_valuation(sum(x),p)==sum(factorial_valuation(v,p) for v in x) for x in grid))
if __name__=='__main__':unittest.main()
