import unittest,itertools,random
from functools import lru_cache
from mask_paths import expression_extrema,shopping_best,beautiful_counts,game_win,minimum_window,sequence_values,checker_count
class MaskPathsTests(unittest.TestCase):
 def test_expression_bruteforce(self):
  rng=random.Random(10690)
  for _ in range(180):
   n=rng.randint(1,5);m=rng.randint(1,5);values=[rng.randint(-10,10) for _ in range(n+m)];total=sum(values);answers=[sum(choice)*(total-sum(choice)) for choice in itertools.combinations(values,n)];self.assertEqual(expression_extrema(n,m,values),(max(answers),min(answers)))
 def test_shopping_all_tours(self):
  rng=random.Random(11284)
  for _ in range(50):
   n=rng.randint(1,5);d=[[0 if i==j else rng.randint(0,50) for j in range(n+1)] for i in range(n+1)];edges=[]
   for i in range(n+1):
    for j in range(i):d[i][j]=d[j][i];edges.append((i,j,d[i][j]))
   for k in range(n+1):
    for i in range(n+1):
     for j in range(n+1):d[i][j]=min(d[i][j],d[i][k]+d[k][j])
   offers=[(rng.randint(1,n),rng.randint(1,100)) for _ in range(6)];best=0
   for length in range(1,n+1):
    for tour in itertools.permutations(range(1,n+1),length):
     profit=sum(value for store,value in offers if store in tour);cost=d[0][tour[0]]+sum(d[u][v] for u,v in zip(tour,tour[1:]))+d[tour[-1]][0];best=max(best,profit-cost)
   self.assertEqual(shopping_best(n,edges,offers),best)
 def test_beautiful_enumeration(self):
  for base in range(2,7):
   counts=beautiful_counts(base);walks=[(x,1<<x) for x in range(1,base)];total=0
   for length in range(1,12):
    total+=sum(mask==(1<<base)-1 for _,mask in walks);self.assertEqual(counts[length],total);walks=[(y,mask|1<<y) for x,mask in walks for y in (x-1,x+1) if 0<=y<base]
 def test_game_remove_actual_digits(self):
  @lru_cache(None)
  def play(s):return any(not play(s[:i]+s[i+1:]) for i in range(len(s)) if sum(map(int,s[:i]+s[i+1:]))%3==0)
  for length in range(1,8):
   for values in itertools.product('123',repeat=length):
    s=''.join(values);counts=tuple(sum(int(c)%3==r for c in s) for r in range(3));self.assertEqual(game_win(counts),play(s))
  self.assertFalse(game_win((1000,0,0)));self.assertTrue(game_win((999,0,0)))
 def test_windows_all_intervals(self):
  for n in range(3,28):
   for m in range(1,12):
    values=list(sequence_values(n,m))
    for k in range(2,8):
     answers=[j-i for i in range(n) for j in range(i+1,n+1) if set(range(1,k+1))<=set(values[i:j])];self.assertEqual(minimum_window(n,m,k),min(answers) if answers else None)
  self.assertEqual(minimum_window(3,1,3),3)
 def test_checkers_explicit_paths(self):
  rng=random.Random(11957)
  for _ in range(200):
   n=rng.randint(1,8);board=[['B' if rng.random()<.4 else '.' for j in range(n)] for i in range(n)];r,c=rng.randrange(n),rng.randrange(n);board[r][c]='W'
   def walk(row,col):
    if row==0:return 1
    total=0
    for dc in (-1,1):
     rr,cc=row-1,col+dc
     if not 0<=cc<n:continue
     if board[rr][cc]=='B':rr-=1;cc+=dc
     if rr>=0 and 0<=cc<n and board[rr][cc]!='B':total+=walk(rr,cc)
    return total
   self.assertEqual(checker_count(board),walk(r,c)%1000007)
if __name__=='__main__':unittest.main()
