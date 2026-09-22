import itertools,math,random,unittest
from fractions import Fraction
from rational_results import ROOT,TIGHT,LINES,prime,prime_rows,tight_count,tournament_rows,format_tournaments,line_rows,format_lines,matches,render,rounded,parse_lines

class RationalResultsTests(unittest.TestCase):
 def test_miller_rabin_matches_naive_trial_for_full_polynomial_domain(self):
  for n in range(10001):
   value=n*n+n+41;wanted=all(value%d for d in range(3,math.isqrt(value)+1,2));self.assertEqual(prime(value),wanted)
  for n in [0,1,2,3,4,25,341,561,2047,25326001]:self.assertEqual(prime(n),n>=2 and all(n%d for d in range(2,math.isqrt(n)+1)))
 def test_matrix_walks_match_all_small_words(self):
  for k in range(5):
   for n in range(1,7):self.assertEqual(tight_count(k,n),sum(all(abs(a-b)<=1 for a,b in zip(row,row[1:])) for row in itertools.product(range(k+1),repeat=n)))
 def test_exact_rounding_accepts_only_nearest_with_both_midpoint_sides(self):
  for numerator in range(-100,101):
   for denominator in range(1,30):
    value=Fraction(numerator,denominator);self.assertTrue(matches([[(value,2)]],rounded(value,2)))
    center=round(value*100)
    for scaled in range(center-2,center+3):
     text=('-' if scaled<0 else '')+f'{abs(scaled)//100}.{abs(scaled)%100:02d}'
     self.assertEqual(matches([[(value,2)]],text),abs(Fraction(scaled,100)-value)<=Fraction(1,200))
  self.assertFalse(matches([['POINT ',(Fraction(1,8),2)]],'POINT NaN'))
 def test_tournament_pair_contract_and_draws(self):
  cases=[(1,1,[]),(2,2,[(0,'rock',1,'scissors'),(1,'paper',0,'paper')])];rows=tournament_rows(format_tournaments(cases));self.assertTrue(matches(rows,'-\n\n1.000\n0.000'))
  with self.assertRaises(AssertionError):tournament_rows('3 1\n1 rock 2 paper\n1 rock 2 paper\n1 rock 2 paper\n0\n')
 def test_rational_intersections_satisfy_both_lines(self):
  rng=random.Random(378)
  for _ in range(1000):
   coordinates=[rng.randrange(-20,21) for _ in range(8)];x1,y1,x2,y2,x3,y3,x4,y4=coordinates
   if (x1,y1)==(x2,y2) or (x3,y3)==(x4,y4):continue
   row=line_rows(format_lines([coordinates]))[1]
   if row[0]=='POINT ':
    x,y=row[1][0],row[3][0];self.assertEqual((x-x1)*(y2-y1),(y-y1)*(x2-x1));self.assertEqual((x-x3)*(y4-y3),(y-y3)*(x4-x3))
 def test_line_count_split_preserves_all_records(self):
  cases=[[0,0,1,0,i,-1,i,1] for i in range(15)];original=format_lines(cases)
  with self.assertRaises(AssertionError):parse_lines(original)
  self.assertEqual(parse_lines(format_lines(cases[:10]))+parse_lines(format_lines(cases[10:])),parse_lines(original,False))
 def test_python_reference_rounding_and_complete_tight_domain(self):
  source=(ROOT/'content/editorials'/TIGHT/'python3.py').read_text().split('for line in sys.stdin:')[0];namespace={};exec(compile(source,'rational-reference','exec'),namespace)
  for k in range(10):
   for n in range(1,101):self.assertTrue(matches([[(Fraction(100*tight_count(k,n),(k+1)**n),5)]],namespace['fixed_ratio'](100*tight_count(k,n),(k+1)**n,5)))
if __name__=='__main__':unittest.main()
