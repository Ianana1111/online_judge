import unittest,itertools,random,math
from missingstructures import network_answers,oil_count,largest_concatenation,coprime_count,burger_answer,ORACLES,additions
class MissingStructureTests(unittest.TestCase):
 def test_network_chronological_closure(self):
  rng=random.Random(793)
  for _ in range(50):
   n=8;reach=[[i==j for j in range(n)] for i in range(n)];commands=[];yes=no=0
   for _ in range(50):
    op=rng.choice('cq');a=rng.randrange(n);b=rng.randrange(n);commands.append((op,a+1,b+1))
    if op=='c':
     reach[a][b]=reach[b][a]=True
     for k in range(n):
      for i in range(n):
       for j in range(n):reach[i][j]|=reach[i][k] and reach[k][j]
    elif reach[a][b]:yes+=1
    else:no+=1
   self.assertEqual(network_answers(n,commands),(yes,no))
 def test_oil_exhaustive_eight_neighbors(self):
  for mask in range(512):
   grid=[''.join('@' if mask>>(r*3+c)&1 else '*' for c in range(3)) for r in range(3)];unseen={(r,c) for r in range(3) for c in range(3) if grid[r][c]=='@'};count=0
   while unseen:
    count+=1;pending=[unseen.pop()]
    for r,c in pending:
     neighbors={p for p in unseen if max(abs(p[0]-r),abs(p[1]-c))==1};unseen-=neighbors;pending.extend(neighbors)
   self.assertEqual(oil_count(grid),count)
 def test_oil_component_bound(self):
  with self.assertRaises(AssertionError):oil_count(['@'*11]*10)
 def test_children_all_permutations(self):
  rng=random.Random(10905)
  for _ in range(100):
   values=[str(rng.randrange(1,100)) for _ in range(rng.randrange(1,7))];self.assertEqual(largest_concatenation(values),max(''.join(a) for a in itertools.permutations(values)))
 def test_totient_direct_gcd(self):
  for n in range(1,1000):self.assertEqual(coprime_count(n),sum(math.gcd(m,n)==1 for m in range(n)))
 def test_burgers_all_pairs(self):
  for m,n,t in itertools.product(range(1,10),range(1,10),range(1,40)):
   used,count=max((x*m+y*n,x+y) for x in range(t//m+1) for y in range(t//n+1) if x*m+y*n<=t);self.assertEqual(burger_answer(m,n,t),(count,t-used))
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
