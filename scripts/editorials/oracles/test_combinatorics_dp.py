import itertools,math,random,unittest
from combinatorics_dp import median_answers,stirling_parity,queen_attacks,palindrome_groups,placements,balanced_binary,tower_height,huge
class CombinatoricsDPTests(unittest.TestCase):
 def test_median_full_objective(self):
  rng=random.Random(10057)
  for n in range(1,21):
   for _ in range(4):
    a=[rng.randrange(10) for _ in range(n)];cost=[sum(abs(x-c) for x in a) for c in range(10)];best=min(cost);choices=[c for c,v in enumerate(cost) if v==best];self.assertEqual(median_answers(a),(choices[0],sum(x in choices for x in a),len(choices)))
  self.assertEqual(median_answers([0,65535]),(0,2,65536))
 def test_stirling_against_original_recurrence(self):
  previous=[1]
  for n in range(1,700):
   current=[0]*(n+1)
   for m in range(1,n+1):current[m]=((m*previous[m] if m<len(previous) else 0)+previous[m-1])%2;self.assertEqual(stirling_parity(n,m),current[m])
   previous=current
  for n in [1,2,999999999,10**9]:self.assertEqual(stirling_parity(n,1),1);self.assertEqual(stirling_parity(n,n),1)
 def test_ordered_queen_pairs(self):
  for m,n in itertools.product(range(1,9),repeat=2):
   squares=list(itertools.product(range(m),range(n)));answer=sum(a!=b and (a[0]==b[0] or a[1]==b[1] or abs(a[0]-b[0])==abs(a[1]-b[1])) for a in squares for b in squares);self.assertEqual(queen_attacks(m,n),answer)
  self.assertEqual(queen_attacks(1,10**6),10**6*(10**6-1));self.assertLess(queen_attacks(10**6,10**6),2**63)
 def test_palindrome_all_partitions(self):
  for n in range(1,9):
   for letters in itertools.product('ab',repeat=n):
    s=''.join(letters);best=n
    for mask in range(1<<(n-1)):
     cuts=[0]+[i+1 for i in range(n-1) if mask>>i&1]+[n];parts=[s[a:b] for a,b in zip(cuts,cuts[1:])]
     if all(p==p[::-1] for p in parts):best=min(best,len(parts))
    self.assertEqual(palindrome_groups(s),best)
 def test_cheerleaders_all_cell_subsets(self):
  for m,n in [(2,2),(2,3),(3,3),(3,4)]:
   counts=[0]*(m*n+1)
   for selected in range(1<<(m*n)):
    coords=[(i//n,i%n) for i in range(m*n) if selected>>i&1]
    if all(any((y==0,y==m-1,x==0,x==n-1)[side] for y,x in coords) for side in range(4)):counts[len(coords)]+=1
   for k,answer in enumerate(counts):self.assertEqual(placements(m,n,k),answer%1000007)
   self.assertEqual(placements(m,n,m*n+1),0)
 def test_binary_enumeration_and_binomial_bound(self):
  for n in range(1,15):
   for k in range(16):
    expected=0 if k==0 else sum(bin(v).count('1')*2==n and v%k==0 for v in range(1<<(n-1),1<<n));self.assertEqual(balanced_binary(n,k),expected)
  self.assertEqual(balanced_binary(64,1),math.comb(63,31));self.assertEqual(balanced_binary(64,2),math.comb(62,31));self.assertEqual(balanced_binary(64,0),0)
 def test_tower_rotations_and_unlimited_supply(self):
  self.assertEqual(tower_height([(10,20,30)]),40);self.assertEqual(tower_height([(v,v,v) for v in range(1,8)]),28)
  for dims in itertools.product(range(1,5),repeat=3):
   a=[]
   for h in range(3):base=sorted(dims[i] for i in range(3) if i!=h);a.append((*base,dims[h]))
   a.sort();dp=[]
   for i,(x,y,h) in enumerate(a):dp.append(h+max([0]+[dp[j] for j in range(i) if a[j][0]<x and a[j][1]<y]))
   self.assertEqual(tower_height([dims]),max(dp))
 def test_huge_exact_upper_bound(self):
  s='1'+'0'*1000;self.assertEqual(huge(f'2\n{s}\n2 2 5\n0\n3 7 11 12\n'),s+' - Wonderful.\n0 - Wonderful.\n')
  with self.assertRaises(AssertionError):huge('1\n'+'1'+'0'*1001+'\n1 1\n')
if __name__=='__main__':unittest.main()
