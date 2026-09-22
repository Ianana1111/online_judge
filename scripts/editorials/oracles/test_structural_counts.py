import unittest,itertools,random
from structural_counts import grid_count,lying_possible,reliable_max,divisor_table,fibonacci_slice,ones_prefix
class StructuralCountsTests(unittest.TestCase):
 def test_blocked_grid_direct_paths(self):
  for w,h in [(1,1),(2,2),(3,2)]:
   points=[(x,y) for x in range(w+1) for y in range(h+1) if (x,y) not in [(0,0),(w,h)]]
   for mask in range(1<<len(points)):
    obstacles={points[j] for j in range(len(points)) if mask>>j&1}
    def walk(x,y):
     if (x,y) in obstacles or x>w or y>h:return 0
     if (x,y)==(w,h):return 1
     return walk(x+1,y)+walk(x,y+1)
    self.assertEqual(grid_count(w,h,obstacles),walk(0,0))
  self.assertEqual(grid_count(100,100,[(99,100),(100,99)]),0)
 def test_line_graph_all_small(self):
  # Independently enumerate original directed multigraph endpoint assignments;
  # canonical labels cover every partition of the2m endpoints.
  for n in range(4):
   possible=set()
   def partitions(seq):
    if len(seq)==2*n:
     edges=frozenset((i,j) for i in range(n) for j in range(n) if seq[2*i+1]==seq[2*j]);possible.add(edges);return
    for value in range(max(seq,default=-1)+2):partitions(seq+[value])
   partitions([]);pairs=list(itertools.product(range(n),repeat=2))
   for mask in range(1<<len(pairs)):
    edges=frozenset(pairs[j] for j in range(len(pairs)) if mask>>j&1);self.assertEqual(lying_possible(n,edges),edges in possible)
 def test_informants_truth_assignments(self):
  rng=random.Random(11659)
  for _ in range(220):
   n=rng.randint(1,8);statements=[(rng.randint(1,n),rng.choice([-1,1])*rng.randint(1,n)) for j in range(rng.randrange(40))];best=0
   for truth in itertools.product([False,True],repeat=n):
    if all(not truth[x-1] or truth[abs(y)-1]==(y>0) for x,y in statements):best=max(best,sum(truth))
   self.assertEqual(reliable_max(n,statements),best)
 def test_divisors_direct_counts(self):
  counts,best=divisor_table();record=1
  for n in range(1,5001):
   count=sum(n%d==0 for d in range(1,n+1));self.assertEqual(counts[n],count)
   if count>=counts[record]:record=n
   self.assertEqual(best[n],record)
  self.assertEqual(best[10],10)
 def test_fibonacci_actual_strings(self):
  words=['0','1'];rng=random.Random(12041)
  for n in range(2,23):words.append(words[-2]+words[-1])
  for n,s in enumerate(words):
   for _ in range(40):lo=rng.randrange(len(s));hi=min(len(s)-1,lo+rng.randrange(10001));self.assertEqual(fibonacci_slice(n,lo,hi),s[lo:hi+1])
  self.assertEqual(fibonacci_slice(2147483647,0,1),'10');self.assertEqual(fibonacci_slice(2147483646,0,1),'01')
  lengths=[1,1]
  for n in range(2,201):lengths.append(lengths[-2]+lengths[-1])
  for n in range(48,201):
   for pos in [0,1836311903,2147483647]:
    level=n;index=pos
    while level>1:
     split=lengths[level-2]
     if index<split:level-=2
     else:index-=split;level-=1
    self.assertEqual(fibonacci_slice(n,pos,pos),str(level))
 def test_ones_direct_integers(self):
  total=0
  for n in range(10001):total+=bin(n).count('1');self.assertEqual(ones_prefix(n),total)
  for k in range(1,32):self.assertEqual(ones_prefix((1<<k)-1),k*(1<<(k-1)))
if __name__=='__main__':unittest.main()
