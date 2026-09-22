import unittest,itertools,math
from primecoins import arrangements,support_spans,coins,ORACLES,additions
class PrimeCoinTests(unittest.TestCase):
 def test_all_small_coin_distributions(self):
  def distributions(n,m):
   if n==1:yield (m,);return
   for first in range(m+1):
    for rest in distributions(n-1,m-first):yield (first,)+rest
  def prime(d):return d>=2 and all(d%p for p in range(2,math.isqrt(d)+1))
  for n in range(1,9):
   for m in range(1,7):
    expected=0
    for placement in distributions(n,m):
     cells=[i for i,x in enumerate(placement) if x]
     if all(prime(b-a) for a,b in itertools.combinations(cells,2)):expected+=1
    self.assertEqual(arrangements(n,m),expected)
 def test_four_cell_shape(self):self.assertEqual(support_spans()[4],(7,))
 def test_single_coin_or_single_cell(self):
  for n in [1,2,3,100,100000]:self.assertEqual(arrangements(n,1),n)
  for m in [1,2,3,100,100000]:self.assertEqual(arrangements(1,m),1)
 def test_three_cells_closed_form(self):
  for m in [1,2,3,4,100000]:self.assertEqual(arrangements(3,m),m+2)
 def test_example_and_first_quadruple(self):self.assertEqual(coins('2\n3 2\n8 4\n'),'Case 1: 4\nCase 2: 78\n')
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
