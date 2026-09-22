import unittest,itertools
from fractions import Fraction
from layouts import permutation,waves,rotation,snail,snail_result,clock,ORACLES,additions
class LayoutTests(unittest.TestCase):
 def test_all_small_permutations(self):
  for n in range(1,7):
   for p in itertools.permutations(range(1,n+1)):
    a=[f'{i}.00' for i in range(n)];expected=['']*n
    for dest,value in zip(p,a):expected[dest-1]=value
    self.assertEqual(permutation('1\n\n'+' '.join(map(str,p))+'\n'+' '.join(a)+'\n'),'\n'.join(expected)+'\n')
 def test_wave_peak_and_global_seams(self):self.assertEqual(waves('2\n1 2\n2 1\n'),'1\n\n1\n\n1\n22\n1\n')
 def test_rotation_coordinate_map(self):
  for lines in [['ABC','DE'],['','AB',' C'],['a  ',' b'],[''],['a',''],['x'*100]*100]:
   width=max(map(len,lines));grid=[[' ']*len(lines) for _ in range(width)]
   for r,line in enumerate(lines):
    for c,ch in enumerate(line):grid[c][len(lines)-1-r]=ch
   self.assertEqual(rotation('\n'.join(lines)+'\n'),''.join(''.join(row)+'\n' for row in grid))
 def test_snail_fraction_simulation(self):
  for h,u,d,f in itertools.product(range(1,8),range(1,8),range(1,8),[1,10,25,100]):
   height=Fraction(0);climb=Fraction(u);fatigue=Fraction(u*f,100)
   for day in range(1,10000):
    height+=max(0,climb)
    if height>h:expected=f'success on day {day}';break
    height-=d
    if height<0:expected=f'failure on day {day}';break
    climb-=fatigue
   self.assertEqual(snail_result(h,u,d,f),expected)
 def test_clock_all_minutes(self):
  for h in range(1,13):
   for m in range(60):
    diff=abs(Fraction(30*(h%12))+Fraction(m,2)-6*m);angle=min(diff,360-diff)
    self.assertEqual(clock(f'{h}:{m:02d}\n0:00\n').strip(),f'{float(angle):.3f}')
 def test_snail_rejects_zero_fatigue(self):
  with self.assertRaises(AssertionError):snail('6 3 1 0\n0 0 0 0\n')
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
