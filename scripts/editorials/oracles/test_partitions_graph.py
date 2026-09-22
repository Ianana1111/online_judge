import unittest,itertools,random
from partitions_graph import teams,can_square,surfaces,components,bottleneck,ORACLES,additions
class PartitionGraphTests(unittest.TestCase):
 def test_teams_exhaustive_combinations(self):
  rng=random.Random(10032)
  for n in range(1,15):
   for _ in range(30):
    w=[rng.randrange(1,31) for _ in range(n)];total=sum(w);expected=min((tuple(sorted((sum(c),total-sum(c)))) for c in itertools.combinations(w,n//2)),key=lambda p:p[1]-p[0]);self.assertEqual(teams(w),expected)
  self.assertEqual(teams([100,90,200]),(190,200))
 def test_square_assignments(self):
  for sticks in itertools.combinations_with_replacement(range(1,6),6):
   expected=False
   if sum(sticks)%4==0:
    side=sum(sticks)//4
    for labels in itertools.product(range(4),repeat=5):
     bins=[sticks[0],0,0,0]
     for v,k in zip(sticks[1:],labels):bins[k]+=v
     if bins==[side]*4:expected=True;break
   self.assertEqual(can_square(sticks),expected)
  self.assertFalse(can_square([2,2,2,3,3,4]))
 def test_boxes_direct_all_pairs(self):
  table=surfaces()
  for n in range(1,150):self.assertEqual(table[n],min(2*(a*b+a*(n//a//b)+b*(n//a//b)) for a in range(1,n+1) for b in range(1,n+1) if n%(a*b)==0))
 def test_components_transitive_closure(self):
  rng=random.Random(10583)
  for _ in range(100):
   n=8;edges=[(a+1,b+1) for a in range(n) for b in range(a+1,n) if rng.random()<.2];reach=[[a==b for b in range(n)] for a in range(n)]
   for a,b in edges:reach[a-1][b-1]=reach[b-1][a-1]=True
   for k in range(n):
    for a in range(n):
     for b in range(n):reach[a][b]|=reach[a][k] and reach[k][b]
   self.assertEqual(components(n,edges),len({tuple(row) for row in reach}))
 def test_capacity_simple_paths(self):
  rng=random.Random(10099)
  for _ in range(80):
   n=6;edges=[(i,i+1,rng.randrange(2,31)) for i in range(1,n)]+[(a,b,rng.randrange(2,31)) for a in range(1,n+1) for b in range(a+2,n+1) if rng.random()<.4];results=[]
   def visit(u,seen,capacity):
    if u==n:results.append(capacity);return
    for a,b,c in edges:
     v=b if a==u else a if b==u else None
     if v is not None and v not in seen:visit(v,seen|{v},min(capacity,c))
   visit(1,{1},10**9);self.assertEqual(bottleneck(n,edges,1,n),max(results))
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
