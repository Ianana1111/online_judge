import unittest,itertools,random,math
from fractions import Fraction
from routes_algebra import railway_best,bfs_matrix,red_prefix,patch_best,subset_count,equation_answer
class RoutesAlgebraTests(unittest.TestCase):
 def test_railway_floyd(self):
  rng=random.Random(11792)
  for _ in range(100):
   n=rng.randint(2,12);line=list(range(n));rng.shuffle(line);lines=[line]+[rng.sample(range(n),rng.randint(2,n)) for i in range(rng.randint(1,5))];distance=[[0 if u==v else 100000 for v in range(n)] for u in range(n)];counts=[0]*n
   for line in lines:
    for u in set(line):counts[u]+=1
    for u,v in zip(line,line[1:]):distance[u][v]=distance[v][u]=1
   for k in range(n):
    for u in range(n):
     for v in range(n):distance[u][v]=min(distance[u][v],distance[u][k]+distance[k][v])
   important=[i for i,c in enumerate(counts) if c>1];answer=min((sum(distance[u][v] for v in important),u+1) for u in important)[1];self.assertEqual(railway_best(n,lines),answer)
 def test_traffic_distances_floyd(self):
  rng=random.Random(12319)
  for _ in range(100):
   n=rng.randint(3,12);graph=[[v for v in range(n) if v!=u and rng.random()<.2] for u in range(n)];d=[[0 if u==v else 10000 for v in range(n)] for u in range(n)]
   for u in range(n):
    for v in graph[u]:d[u][v]=1
   for k in range(n):
    for u in range(n):
     for v in range(n):d[u][v]=min(d[u][v],d[u][k]+d[k][v])
   self.assertEqual(bfs_matrix(graph),[[v if v<10000 else None for v in row] for row in d])
 def test_red_actual_expansion(self):
  grid=[[1]]
  for k in range(8):
   total=0;self.assertEqual(red_prefix(k,0),0)
   for i,row in enumerate(grid):total+=sum(row);self.assertEqual(red_prefix(k,i+1),total)
   n=len(grid);following=[[0]*(2*n) for _ in range(2*n)]
   for r in range(n):
    for c in range(n):
     if grid[r][c]:following[2*r][2*c]=following[2*r][2*c+1]=following[2*r+1][2*c]=1
   grid=following
  self.assertEqual(red_prefix(30,1<<30),3**30)
 def test_patches_arbitrary_integer_placements(self):
  rng=random.Random(12654)
  for _ in range(250):
   c=rng.randint(1,12);n=rng.randint(1,min(c,8));holes=rng.sample(range(c),n);t1,t2=rng.randint(1,c),rng.randint(1,c);options=[]
   for length in (t1,t2):
    for start in range(c):options.append((sum(1<<i for i,h in enumerate(holes) if (h-start)%c<=length),length))
   dp=[10**9]*(1<<n);dp[0]=0
   for mask in range(1<<n):
    for covered,price in options:dp[mask|covered]=min(dp[mask|covered],dp[mask]+price)
   self.assertEqual(patch_best(c,t1,t2,holes),dp[-1])
 def test_subsets_all_index_choices(self):
  rng=random.Random(12911)
  for _ in range(180):
   n=rng.randint(1,13);values=rng.sample(range(-30,31),n);target=rng.randint(-30,30);answer=sum(sum(value for i,value in enumerate(values) if mask>>i&1)==target for mask in range(1,1<<n));self.assertEqual(subset_count(values,target),answer)
  self.assertEqual(subset_count([0],0),1)
 def test_equations_known_coefficients(self):
  rng=random.Random(1200)
  for _ in range(4000):
   a,b,c,d=[rng.randint(0,1000) for i in range(4)];eq=f'{a}x+{b}={c}x+{d}';expected='IDENTITY' if b==d else 'IMPOSSIBLE'
   if a!=c:expected=str(math.floor(Fraction(d-b,a-c)))
   self.assertEqual(equation_answer(eq),expected)
  for invalid in ['-x=1','+x=1','x++1=2','1001x=0']:
   with self.assertRaises(AssertionError):equation_answer(invalid)
if __name__=='__main__':unittest.main()
