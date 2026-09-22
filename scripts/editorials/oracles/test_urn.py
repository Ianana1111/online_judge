import math,subprocess,tempfile,unittest
from decimal import Decimal,localcontext,ROUND_FLOOR
from fractions import Fraction
from pathlib import Path
from urn import *
class UrnTests(unittest.TestCase):
 def test_exact_small_rational_probabilities_and_zero_counts(self):
  survival=Fraction(1)
  with localcontext() as context:
   context.prec=70;values=values_at(tuple(range(201)))
   for n in range(201):
    if n:survival*=1-Fraction(1,n*(n+1))
    probability=1-survival;expected=Decimal(probability.numerator)/Decimal(probability.denominator);self.assertEqual(values[n][0],f'{expected:.6f}')
    denominator=math.factorial(n)*math.factorial(n+1);self.assertEqual(zero_count(n),len(str(denominator))-1)
 def test_stirling_intervals_contain_exact_factorial_logarithms(self):
  with localcontext() as context:
   context.prec=70
   for n in [100,101,200,1000,10000]:
    exact=Decimal(math.factorial(n)).log10();low,high=factorial_log_bounds(n);self.assertLessEqual(low,exact);self.assertGreaterEqual(high,exact)
 def test_boundary_screen_uses_the_complete_original_domain(self):
  screen=boundary_screen();self.assertEqual(len(screen['probability']),30);self.assertEqual(len(screen['zeroCount']),30);self.assertEqual(screen['zeroCount'][0][1],522448)
  for distance,n,approximation in screen['zeroCount']:
   self.assertEqual(zero_count(n),math.floor(approximation));self.assertGreater(distance,1e-8)
  self.assertEqual(urn_output('1\n2\n20\n'),'0.500000 0\n0.583333 1\n0.688850 38\n');self.assertTrue(valid('0','-0.000000 0'));self.assertFalse(valid('2','0.583334 1'))
 def test_canonical_compensated_logs_against_high_precision_products(self):
  headers='\n'.join('#include <'+h+'>' for h in ['iostream','vector','algorithm','iomanip','cmath','utility'])
  with tempfile.TemporaryDirectory() as directory:
   path=Path(directory);source=(ROOT/'content/editorials'/URN/'cpp17.cpp').read_text().replace('#include <bits/stdc++.h>',headers);(path/'main.cpp').write_text(source);subprocess.run(['c++','-std=c++17','-O2',str(path/'main.cpp'),'-o',str(path/'reference')],check=True,capture_output=True)
   for data in additions():
    result=subprocess.run([str(path/'reference')],input=data,text=True,capture_output=True,check=True);self.assertTrue(valid(data,result.stdout))
if __name__=='__main__':unittest.main()
