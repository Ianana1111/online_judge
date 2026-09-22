import itertools,random,unittest
from missingsequences import wavio_length,container_capacity,maximum_gain,robot_position,is_subsequence,book_pair,quirks,bigmods
class MissingSequenceTests(unittest.TestCase):
 def test_wavio_all_subsequences(self):
  rng=random.Random(10534)
  for n in range(1,11):
   for _ in range(25):
    a=[rng.randrange(-2,3) for _ in range(n)];best=1
    for mask in range(1,1<<n):
     b=[v for i,v in enumerate(a) if mask>>i&1];k=len(b)//2
     if len(b)%2 and all(b[i]<b[i+1] for i in range(k)) and all(b[i]>b[i+1] for i in range(k,len(b)-1)):best=max(best,len(b))
    self.assertEqual(wavio_length(a),best)
 def test_partition_all_cut_sets(self):
  rng=random.Random(11413)
  for n in range(1,11):
   for _ in range(15):
    a=[rng.randrange(1,10) for _ in range(n)]
    for m in range(1,n+2):
     best=sum(a)
     for cut in itertools.combinations(range(1,n),min(m,n)-1):
      ends=(0,)+cut+(n,);best=min(best,max(sum(a[x:y]) for x,y in zip(ends,ends[1:])))
     self.assertEqual(container_capacity(a,m),best)
 def test_gain_all_intervals(self):
  for n in range(1,8):
   for a in itertools.product([-2,1],repeat=n):self.assertEqual(maximum_gain(a),max([0]+[sum(a[i:j]) for i in range(n) for j in range(i+1,n+1)]))
 def test_robot_reference_chains(self):
  self.assertEqual(robot_position(['LEFT',0,1,2]),-4)
  self.assertEqual(robot_position(['LEFT','RIGHT',0,1]),0)
  with self.assertRaises(AssertionError):robot_position([0])
 def test_subsequence_dynamic_programming(self):
  for n in range(1,8):
   for chars in itertools.product('aA',repeat=n):
    t=''.join(chars)
    for s in ('a','A','aa','aA','Aa','AA','aAa'):
     dp=[False]*(len(s)+1);dp[0]=True
     for ch in t:
      for i in range(len(s),0,-1):dp[i]|=dp[i-1] and s[i-1]==ch
     self.assertEqual(is_subsequence(s,t),dp[-1])
 def test_book_distinct_indices_and_ties(self):
  rng=random.Random(11057)
  for n in range(2,40):
   for _ in range(20):
    a=[rng.randrange(1,30) for _ in range(n)];i,j=rng.sample(range(n),2);target=a[i]+a[j];pairs=[tuple(sorted((a[i],a[j]))) for i in range(n) for j in range(i+1,n) if a[i]+a[j]==target];self.assertEqual(book_pair(a,target),min(pairs,key=lambda p:p[1]-p[0]))
  self.assertEqual(book_pair([1,4,5,9],10),(1,9))
 def test_modular_against_repeated_multiplication(self):
  for b,p,m in itertools.product(range(10),range(15),range(1,15)):
   expected=1%m
   for _ in range(p):expected=expected*b%m
   self.assertEqual(bigmods(f'{b} {p} {m}'),str(expected)+'\n')
 def test_quirks_complete_small_domain_and_large_properties(self):
  for digits in (2,4):
   base=10**(digits//2);self.assertEqual(quirks(digits),[n for n in range(base*base) if (n//base+n%base)**2==n])
  for digits in (6,8):
   base=10**(digits//2);values=quirks(digits);self.assertEqual(values,sorted(set(values)));self.assertIn(0,values);self.assertIn(1,values)
   for n in values:self.assertTrue(0<=n<base*base);self.assertEqual((n//base+n%base)**2,n)
if __name__=='__main__':unittest.main()
