import itertools,unittest
from functools import lru_cache
from bounds_walks import kth_walk,thief_value,knight_matching,knight_count,tile_sizes,MOVES
class BoundsWalkTests(unittest.TestCase):
 def test_exact_walk_layers_against_all_short_edge_sequences(self):
  choices=[(0,0),(0,1),(1,0),(1,1)]
  for states in itertools.product([-1,0,2],repeat=4):
   edges=[(u,v,w) for (u,v),w in zip(choices,states) if w>=0]
   if not any(u==0 and v==1 for u,v,w in edges):continue
   for k in range(2,5):
    results=[]
    def visit(u,cost,depth):
     if depth and u==1:results.append(cost)
     if depth==2*k:return
     for a,v,w in edges:
      if a==u:visit(v,cost+w,depth+1)
    visit(0,0,0);results.sort();wanted=results[k-1] if len(results)>=k else -1
    self.assertEqual(kth_walk(2,edges,0,1,k),wanted)
 def test_equal_parallel_paths_and_long_positive_cycle(self):
  self.assertEqual(kth_walk(2,[(0,1,7)]*10,0,1,10),7)
  self.assertEqual(kth_walk(2,[(0,1,7),(1,0,3)],0,1,10),97)
  self.assertEqual(kth_walk(3,[(0,1,0),(1,1,0),(1,2,5)],0,2,10),5)
 def test_unique_injection_graph_edge_upper_bound(self):
  for n in range(1,4):
   for m in range(n,5):
    assignments=list(itertools.permutations(range(m),n));maximum=0
    for graph in range(1<<(n*m)):
     count=0
     for assignment in assignments:
      if all(graph>>(i*m+j)&1 for i,j in enumerate(assignment)):count+=1
      if count>1:break
     if count==1:maximum=max(maximum,bin(graph).count('1'))
    self.assertEqual(n*m-maximum,thief_value(n,m))
 def test_small_optimal_adaptive_query_trees(self):
  for n,m in [(1,4),(2,3),(2,4),(3,3)]:
   assignments=list(itertools.permutations(range(m),n));queries=[]
   for key in range(n):
    for door in range(m):queries.append(sum(1<<i for i,a in enumerate(assignments) if a[key]==door))
   @lru_cache(None)
   def search(state):
    if state&(state-1)==0:return 0
    return 1+min(max(search(state&q),search(state&~q)) for q in queries if state&q and state&~q)
   self.assertEqual(search((1<<len(assignments))-1),thief_value(n,m))
 def test_knights_exhaustive_small_independent_sets(self):
  for rows in range(1,5):
   for columns in range(1,5):
    adjacent=[]
    for r in range(rows):
     for c in range(columns):adjacent.append(sum(1<<((r+a)*columns+c+b) for a,b in MOVES if 0<=r+a<rows and 0<=c+b<columns))
    @lru_cache(None)
    def largest(mask):
     if not mask:return 0
     bit=mask&-mask;i=bit.bit_length()-1;remaining=mask^bit;return max(largest(remaining),1+largest(remaining&~adjacent[i]))
    self.assertEqual(knight_count(rows,columns),largest((1<<(rows*columns))-1))
 def test_certified_tile_pairings_and_whole_board_matching(self):
  for rows in range(3,7):
   for columns in range(3,7):self.assertEqual(len(knight_matching(rows,columns)),rows*columns//2)
  for n in range(3,501):
   pieces=tile_sizes(n);self.assertEqual(sum(pieces),n);self.assertLessEqual(sum(x%2 for x in pieces),1)
  for rows in range(1,13):
   for columns in range(1,13):self.assertEqual(knight_count(rows,columns),rows*columns-len(knight_matching(rows,columns)))
  self.assertEqual(knight_count(500,500),125000);self.assertEqual(knight_count(0,5),0)
if __name__=='__main__':unittest.main()
