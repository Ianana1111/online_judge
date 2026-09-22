import itertools,unittest
from collections import deque
from discrete_structures import coin_coefficients,word_indices,knight_distances,leaf,literal_queue,expression_cost,repair_input,matrices
class DiscreteStructureTests(unittest.TestCase):
 def test_coin_counts_by_explicit_quantities(self):
  for n in range(201):
   count=0
   for half in range(n//50+1):
    for quarter in range((n-50*half)//25+1):
     for dime in range((n-50*half-25*quarter)//10+1):count+=(n-50*half-25*quarter-10*dime)//5+1
   self.assertEqual(coin_coefficients()[n//5],count)
  self.assertGreater(coin_coefficients()[6000],2**32)
 def test_word_rank_enumeration(self):
  ranks=word_indices();self.assertEqual(len(ranks),83681)
  for word,value in [('a',1),('z',26),('ab',27),('az',51),('bc',52),('vwxyz',83681)]:self.assertEqual(ranks[word],value)
  for word in ['aa','ba','cat','zyxwv']:self.assertNotIn(word,ranks)
  previous=''
  for word in ranks:
   if len(previous)==len(word):self.assertLess(previous,word)
   self.assertTrue(all(a<b for a,b in zip(word,word[1:])));previous=word
 def test_floyd_against_independent_knight_bfs(self):
  matrix=knight_distances()
  for start in range(64):
   distance={start:0};queue=deque([start])
   while queue:
    v=queue.popleft();x,y=divmod(v,8)
    for dx,dy in [(a,b) for a,b in itertools.product(range(-2,3),repeat=2) if abs(a*b)==2]:
     nx,ny=x+dx,y+dy;w=8*nx+ny
     if 0<=nx<8 and 0<=ny<8 and w not in distance:distance[w]=distance[v]+1;queue.append(w)
   self.assertEqual(matrix[start],[distance[v] for v in range(64)])
 def test_balls_by_full_flag_simulation(self):
  for depth in range(2,12):
   flags=[False]*(1<<depth)
   for number in range(1,(1<<(depth-1))+1):
    node=1
    while node<(1<<(depth-1)):direction=flags[node];flags[node]=not flags[node];node=node*2+direction
    self.assertEqual(leaf(depth,number),node)
  self.assertEqual(leaf(20,1),524288);self.assertEqual(leaf(20,524288),1048575)
 def test_team_membership_and_return(self):
  self.assertEqual(literal_queue([[1,2],[3,4]],[1,3,2,None,None,1,4,None,None,None]),[1,2,3,4,1])
  self.assertEqual(literal_queue([[0,999999]],[0,999999,None,None,0,None]),[0,999999,0])
 def test_matrix_fixed_strategy_and_nested_failure(self):
  dims={'A':(50,10),'B':(10,20),'C':(20,5),'D':(50000,50000)}
  self.assertEqual(expression_cost('A',dims),'0');self.assertEqual(expression_cost('((AB)C)',dims),'15000');self.assertEqual(expression_cost('(A(BC))',dims),'3500');self.assertEqual(expression_cost('(AC)',dims),'error');self.assertEqual(expression_cost('((AC)B)',dims),'error');self.assertEqual(expression_cost('(DD)',dims),'125000000000000')
 def test_matrix_empty_line_repair(self):
  broken='2\nA 2 3\nB 3 4\nA\n\n\n(AB)\n';fixed=repair_input('uva-442-matrix-chain-multiplication',broken);self.assertEqual(fixed,'2\nA 2 3\nB 3 4\nA\n(AB)\n');self.assertEqual(matrices(fixed),'0\n24\n')
  with self.assertRaises(AssertionError):matrices(broken)
if __name__=='__main__':unittest.main()
