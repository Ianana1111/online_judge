import heapq,itertools,random,unittest
from collections import deque
from allocation_paths import marble_count,geonosis_cost,best_program,bounded_digits,make_runs,lex_less

def bfs_program(a,m,p,q,r,s):
 queue=deque([(p,q,'')]);seen={(p,q)}
 while queue:
  low,high,text=queue.popleft()
  if r<=low and high<=s:return text
  for ch,nlow,nhigh in [('A',low+a,high+a),('M',low*m,high*m)]:
   if nhigh<=s and (nlow,nhigh) not in seen:seen.add((nlow,nhigh));queue.append((nlow,nhigh,text+ch))
 return None

def deletion_dijkstra(matrix,order):
 active=set(range(len(matrix)));answer=0
 for removed in order:
  for source in active:
   distances={v:10**30 for v in active};distances[source]=0;queue=[(0,source)]
   while queue:
    distance,u=heapq.heappop(queue)
    if distance!=distances[u]:continue
    for v in active:
     trial=distance+matrix[u][v]
     if trial<distances[v]:distances[v]=trial;heapq.heappush(queue,(trial,v))
   answer+=sum(distances.values())
  active.remove(removed)
 return answer

class MissingModelsTests(unittest.TestCase):
 def test_marbles_all_small_labelled_assignments(self):
  for n in range(1,9):
   for k in range(1,5):
    frequencies=[0]*(n+1)
    for assignment in itertools.product(range(k),repeat=n):frequencies[min(assignment.count(i) for i in range(k))]+=1
    for x in range(1,n+1):self.assertEqual(marble_count(n,k,x),sum(frequencies[x:]),(n,k,x))
 def test_marbles_independent_box_size_recursion(self):
  import math
  from functools import lru_cache
  @lru_cache(None)
  def sizes(n,k,x):
   if k==0:return int(n==0)
   return sum(math.comb(n,j)*sizes(n-j,k-1,x) for j in range(x,n+1))%1000000007
  # Force the inclusion-exclusion branch rather than the small-slack convolution.
  for n,k,x in [(155,3,1),(160,3,2),(180,4,5),(190,5,4),(200,2,20)]:self.assertEqual(marble_count(n,k,x),sizes(n,k,x))
 def test_geonosis_fresh_shortest_paths_each_deletion(self):
  rng=random.Random(13211)
  for n in range(1,9):
   for _ in range(25):
    matrix=[[0 if u==v else rng.randint(1,50) for v in range(n)] for u in range(n)];order=list(range(n));rng.shuffle(order)
    self.assertEqual(geonosis_cost(matrix,order),deletion_dijkstra(matrix,order))
 def test_geonosis_potential_metric_closed_total(self):
  for n in range(2,9):
   matrix=[[0 if u==v else 100+v*v-u*u for v in range(n)] for u in range(n)];order=list(range(n))[::-1]
   self.assertEqual(geonosis_cost(matrix,order),deletion_dijkstra(matrix,order))
 def test_addmul_exhaustive_shortest_lexicographic_bfs(self):
  for a,m in itertools.product(range(1,5),repeat=2):
   for p in range(1,5):
    for q in range(p,6):
     for r in range(1,12):
      for s in range(r,13):
       runs=best_program(a,m,p,q,r,s);actual=None if runs is None else ''.join(ch*n for ch,n in runs)
       self.assertEqual(actual,bfs_program(a,m,p,q,r,s),(a,m,p,q,r,s))
 def test_bounded_digit_dp_and_roundup_candidates(self):
  for base in range(2,7):
   for k in range(5):
    for lower in range(40):
     upper=lower+27
     def digits(v):
      result=[]
      for j in range(k,-1,-1):result.append(v//base**j);v%=base**j
      return tuple(result)
     actual=bounded_digits(lower,upper,base,k)
     wanted=min(((sum(digits(v)),digits(v)) for v in range(lower,upper+1)),key=lambda v:(v[0],tuple(-x for x in v[1])))
     self.assertEqual(actual,wanted)
     candidates={((lower+base**j-1)//base**j)*base**j for j in range(k+1)}
     selected=min(((sum(digits(v)),digits(v)) for v in candidates if v<=upper),key=lambda v:(v[0],tuple(-x for x in v[1])))
     self.assertEqual(selected,wanted)
 def test_compressed_lex_order_and_billion_length(self):
  runs=[make_runs(digits) for digits in itertools.product(range(3),repeat=4)]
  for a in runs:
   for b in runs:self.assertEqual(lex_less(a,b),''.join(ch*n for ch,n in a)<''.join(ch*n for ch,n in b))
  self.assertEqual(best_program(1,1,1,1,10**9,10**9),(('A',999999999),))

if __name__=='__main__':unittest.main()
