import unittest,random,itertools,math
from functools import lru_cache
from treegames import directories,grundy_wins,bee_coordinate,diameter,trees_value,ORACLES,additions
class TreeGameTests(unittest.TestCase):
 def test_directory_hierarchy(self):
  paths=['A0','A\\Z','A\\B\\C','!','A','X\\B'];expected='!\nA\n B\n  C\n Z\nA0\nX\n B'
  self.assertEqual(directories(paths),expected)
  for order in itertools.permutations(paths[:4]):self.assertEqual(directories(list(order)+paths[4:]),expected)
 def test_subtraction_minimax(self):
  for mask in range(32):
   moves=[1]+[i+2 for i in range(5) if mask>>i&1]
   @lru_cache(None)
   def winning(n):return any(not winning(n-m) for m in moves if m<=n)
   for n in range(1,35):self.assertEqual(grundy_wins(n,moves),winning(n))
 def test_bee_image_anchors(self):
  expected=[(0,0),(0,1),(-1,1),(-1,0),(0,-1),(1,-1),(1,0),(1,1),(0,2),(-1,2),(-2,2),(-2,1),(-2,0),(-1,-1),(0,-2),(1,-2),(2,-2),(2,-1),(2,0),(2,1),(1,2),(0,3),(-1,3)]
  self.assertEqual([bee_coordinate(i) for i in range(1,24)],expected)
 def test_bee_complete_domain_invariants(self):
  seen=set();previous=(0,0);ring=0;directions={(0,1),(-1,1),(-1,0),(0,-1),(1,-1),(1,0)}
  for n in range(1,100000):
   while n>1+3*ring*(ring+1):ring+=1
   x,y=bee_coordinate(n);self.assertNotIn((x,y),seen);seen.add((x,y));self.assertEqual(max(abs(x),abs(y),abs(x+y)),ring)
   if n>1:self.assertIn((x-previous[0],y-previous[1]),directions)
   previous=x,y
 def test_diameter_all_pairs(self):
  rng=random.Random(10308)
  for n in range(2,15):
   for _ in range(10):
    edges=[(v,rng.randrange(1,v),rng.randrange(1,31)) for v in range(2,n+1)];d=[[0 if i==j else 10**9 for j in range(n)] for i in range(n)]
    for a,b,w in edges:d[a-1][b-1]=d[b-1][a-1]=w
    for k in range(n):
     for i in range(n):
      for j in range(n):d[i][j]=min(d[i][j],d[i][k]+d[k][j])
    self.assertEqual(diameter(edges),max(map(max,d)))
 def test_labeled_root_decomposition(self):
  count=[1]
  for n in range(1,11):count.append(n*sum(math.comb(n-1,left)*count[left]*count[n-1-left] for left in range(n)));self.assertEqual(trees_value(n),count[-1])
  self.assertEqual(count[:4],[1,1,4,30]);self.assertGreater(len(str(trees_value(300))),700)
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
