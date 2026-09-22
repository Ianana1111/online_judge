import unittest,itertools,random
from fractions import Fraction
from gpe_readiness import mine_board,zipf,ritual_steps,vulnerable,rotation_index,exact_cover,valid_completion,sudoku_expected_valid
class GpeReadinessTests(unittest.TestCase):
 def test_mines_all_two_by_two(self):
  for mine in range(16):
   for touch in range(16):
    mines=[''.join('*' if mine>>(r*2+c)&1 else '.' for c in range(2)) for r in range(2)];touched=[''.join('x' if touch>>(r*2+c)&1 else '.' for c in range(2)) for r in range(2)];lost=bool(mine&touch);expected=[]
    for r in range(2):
     row=''
     for c in range(2):
      if lost and mines[r][c]=='*':row+='*'
      elif touched[r][c]=='x':row+=str(sum(mines[rr][cc]=='*' for rr in range(2) for cc in range(2) if (rr,cc)!=(r,c)))
      else:row+='.'
     expected.append(row)
    self.assertEqual(mine_board(mines,touched),expected)
 def test_zipf_boundaries(self):
  self.assertEqual(zipf("2\nA,a B1b\nEndOfText\n1\nCan't re-enter.\nEndOfText\n1\n123 --\nEndOfText\n"),"a\nb\n\ncan\nenter\nre\nt\n\nThere is no such word.\n")
  self.assertEqual(zipf('10000\n'+('Word '*10000)+'\nEndOfText\n'),'word\n')
 def test_ritual_explicit_relaxation(self):
  rng=random.Random(928)
  for _ in range(130):
   r,c=rng.randint(2,5),rng.randint(2,5);grid=[['#' if rng.random()<.2 else '.' for j in range(c)] for i in range(r)];start,end=rng.sample(range(r*c),2);grid[start//c][start%c]='S';grid[end//c][end%c]='E';edges=[]
   for cell in range(r*c):
    row,col=divmod(cell,c)
    if grid[row][col]=='#':continue
    for phase in range(3):
     for dr,dc in [(-1,0),(1,0),(0,-1),(0,1)]:
      rr,cc=row,col;valid=True
      for step in range(phase+1):
       rr+=dr;cc+=dc
       if not(0<=rr<r and 0<=cc<c) or grid[rr][cc]=='#':valid=False;break
      if valid:edges.append((cell*3+phase,(rr*c+cc)*3+(phase+1)%3))
   distance=[10000]*(r*c*3);distance[start*3]=0
   for repeat in range(r*c*3):
    changed=False
    for u,v in edges:
     if distance[v]>distance[u]+1:distance[v]=distance[u]+1;changed=True
    if not changed:break
   best=min(distance[end*3:end*3+3]);self.assertEqual(ritual_steps(grid),best if best<10000 else None)
  self.assertIsNone(ritual_steps(['S.#E','####']))
 def test_gophers_all_matchings(self):
  rng=random.Random(10080)
  for _ in range(120):
   n,m=rng.randint(1,5),rng.randint(1,5);points=rng.sample(list(itertools.product(range(-3,4),repeat=2)),n+m);g,h=points[:n],points[n:];radius=rng.randint(1,3)
   def search(i,used):
    if i==n:return 0
    return max([search(i+1,used)]+[1+search(i+1,used|1<<j) for j,(x,y) in enumerate(h) if not used>>j&1 and (g[i][0]-x)**2+(g[i][1]-y)**2<=radius**2])
   self.assertEqual(vulnerable(g,h,1,radius),n-search(0,0))
  self.assertEqual(vulnerable([(Fraction('0.1'),Fraction('0.2'))],[(Fraction('3.1'),Fraction('4.2'))],1,5),0)
  self.assertEqual(vulnerable([(Fraction('0.1'),Fraction('0.2'))],[(Fraction('3.1001'),Fraction('4.2'))],1,5),1)
 def test_beads_all_rotations(self):
  for n in range(1,8):
   for chars in itertools.product('abc',repeat=n):
    word=''.join(chars);expected=min((word[i:]+word[:i],i+1) for i in range(n))[1];self.assertEqual(rotation_index(word),expected)
  self.assertEqual(rotation_index('ab'*5000),1);self.assertEqual(rotation_index('b'+'a'*9999),2)
 def test_sudoku_bruteforce_and_certificates(self):
  base=tuple((r*3+r//3+c)%9+1 for r in range(9) for c in range(9));rng=random.Random(201503)
  def brute(puzzle):
   grid=list(puzzle)
   def search():
    if 0 not in grid:return valid_completion(puzzle,grid)
    cell=grid.index(0);r,c=divmod(cell,9);used=set(grid[9*r:9*r+9])|set(grid[c::9])|{grid[(r//3*3+i)*9+c//3*3+j] for i in range(3) for j in range(3)}
    for digit in range(1,10):
     if digit not in used:
      grid[cell]=digit
      if search():return True
    grid[cell]=0;return False
   return search()
  for _ in range(50):
   puzzle=list(base)
   for cell in rng.sample(range(81),rng.randint(1,12)):puzzle[cell]=0
   self.assertTrue(brute(puzzle));answer=exact_cover(tuple(puzzle));self.assertIsNotNone(answer);self.assertTrue(valid_completion(puzzle,answer))
  subtle=list(base);subtle[0]=2;subtle[1]=0;subtle[27]=0
  self.assertFalse(brute(subtle));self.assertIsNone(exact_cover(tuple(subtle)));self.assertTrue(sudoku_expected_valid([tuple(subtle)],'NO'))
  empty=(0,)*81;alternate=tuple(10-x for x in base);self.assertTrue(sudoku_expected_valid([empty],' '.join(map(str,alternate))));self.assertFalse(sudoku_expected_valid([empty],'NO'));self.assertFalse(sudoku_expected_valid([empty],' '.join(map(str,base))+' 1'))
if __name__=='__main__':unittest.main()
