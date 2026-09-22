import unittest,itertools,math
from functools import lru_cache
from common_completion import moving,balanced,odd_sum,fib_representation,digit_divisions,ORACLES,additions
class CommonCompletionTests(unittest.TestCase):
 def test_bricks_exhaustive(self):
  for n in range(1,6):
   for h in itertools.product(range(1,6),repeat=n):
    if sum(h)%n==0:self.assertEqual(moving(h),sum(abs(v-sum(h)//n) for v in h)//2)
 def test_parenthesis_grammar(self):
  @lru_cache(None)
  def legal(s):
   if not s:return True
   if len(s)%2:return False
   return any((s[0],s[k]) in [('(',')'),('[',']')] and legal(s[1:k]) and legal(s[k+1:]) for k in range(1,len(s),2))
  for n in range(7):
   for p in itertools.product('()[]',repeat=n):
    s=''.join(p);self.assertEqual(balanced(s),legal(s))
 def test_odd_rows_generated(self):
  next_odd=1
  for length in range(1,2000,2):
   row=list(range(next_odd,next_odd+2*length,2));next_odd+=2*length
   if length>1:self.assertEqual(odd_sum(length),sum(row[-3:]))
 def test_fib_all_small_subsets(self):
  fib=[1,2]
  while len(fib)<14:fib.append(fib[-1]+fib[-2])
  expected={}
  for mask in range(1,1<<len(fib)):
   if mask&(mask<<1):continue
   value=sum(v for i,v in enumerate(fib) if mask>>i&1);self.assertNotIn(value,expected);expected[value]=bin(mask)[2:]
  for value in range(1,500):self.assertEqual(fib_representation(value),expected[value])
 def test_divisions_independent_digit_multiset(self):
  table=digit_divisions()
  for n in range(2,80):
   expected=[(d*n,d) for d in range(1234,98765//n+1) if sorted(f'{d*n:05d}{d:05d}')==list('0123456789')];self.assertEqual(table[n],expected)
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
