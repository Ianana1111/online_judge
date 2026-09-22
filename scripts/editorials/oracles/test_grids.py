import unittest,itertools
from grids import rectangle_area,language_counts,digit_prime_values,barcode_count,ORACLES,additions
class GridTests(unittest.TestCase):
 def test_rectangles_exhaustive(self):
  for r,c in [(1,1),(2,3),(3,3)]:
   for mask in range(1<<(r*c)):
    grid=[[(mask>>(i*c+j))&1 for j in range(c)] for i in range(r)];best=0
    for top in range(r):
     for bottom in range(top,r):
      for left in range(c):
       for right in range(left,c):
        if all(grid[i][j]==0 for i in range(top,bottom+1) for j in range(left,right+1)):best=max(best,(bottom-top+1)*(right-left+1))
    self.assertEqual(rectangle_area(grid),best)
 def test_languages_transitive_closure(self):
  for mask in range(512):
   grid=[''.join('ab'[(mask>>(r*3+c))&1] for c in range(3)) for r in range(3)];reachable=[[False]*9 for _ in range(9)]
   for a in range(9):
    for b in range(9):reachable[a][b]=a==b or (grid[a//3][a%3]==grid[b//3][b%3] and abs(a//3-b//3)+abs(a%3-b%3)==1)
   for k in range(9):
    for a in range(9):
     for b in range(9):reachable[a][b]|=reachable[a][k] and reachable[k][b]
   counts={}
   for a in range(9):
    if not any(reachable[a][b] for b in range(a)):counts[grid[a//3][a%3]]=counts.get(grid[a//3][a%3],0)+1
   self.assertEqual(language_counts(grid),counts)
 def test_digit_primes_trial_division(self):
  def prime(n):return n>=2 and all(n%d for d in range(2,__import__('math').isqrt(n)+1))
  expected=[n for n in range(1,10000) if prime(n) and prime(sum(map(int,str(n))))]
  self.assertEqual([n for n in digit_prime_values() if n<10000],expected)
 def test_barcodes_width_enumeration(self):
  for k in range(1,7):
   for m in range(1,6):
    counts={}
    for widths in itertools.product(range(1,m+1),repeat=k):counts[sum(widths)]=counts.get(sum(widths),0)+1
    for n in range(1,k*m+2):self.assertEqual(barcode_count(n,k,m),counts.get(n,0))
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
