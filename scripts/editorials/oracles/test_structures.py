import unittest,random
from itertools import product
from structures import ORACLES,additions,dpa,cipher,dna,generators,score,can_box,ducci_kind,gaps,cantor,quotes
class StructureTests(unittest.TestCase):
 def test_all_dpa(self):
  for n in range(2,1001):
   s=sum(d for d in range(1,n) if n%d==0);wanted='deficient' if s<n else 'perfect' if s==n else 'abundant'
   self.assertEqual(dpa(f'1\n{n}\n').strip(),wanted)
 def test_cipher(self):self.assertEqual(cipher('AAB\nCCD\nAAABBC\nAAABCD\n'),'YES\nNO\n')
 def test_dna_full_enumeration(self):
  rng=random.Random(1368)
  for _ in range(15):
   rows=[''.join(rng.choice('ACGT') for _ in range(4)) for _ in range(4)]
   choices=[''.join(a) for a in product('ACGT',repeat=4)]
   errors=lambda s:sum(a!=b for row in rows for a,b in zip(s,row))
   expected=min((errors(s),s) for s in choices);self.assertEqual(dna('1\n4 4\n'+'\n'.join(rows)+'\n'),expected[1]+'\n'+str(expected[0])+'\n')
 def test_generators_exhaustive_small(self):
  for n in range(1,1001):
   wanted=next((x for x in range(1,n+1) if x+sum(map(int,str(x)))==n),0)
   self.assertEqual(generators(f'1\n{n}\n').strip(),str(wanted))
 def test_scores(self):self.assertEqual(score('4\nOOXXOXXOOO\nO\nX\n'+('O'*79)+'\n'),'10\n1\n0\n3160\n')
 def test_boxes(self):
  self.assertTrue(can_box([(3,2),(2,3),(5,2),(2,5),(3,5),(5,3)]))
  self.assertTrue(can_box([(4,4)]*6))
  self.assertFalse(can_box([(1,2)]*2+[(3,4)]*2+[(5,6)]*2))
 def test_ducci_exhaustive(self):
  for n in range(3,6):
   for a in product(range(3),repeat=n):
    seen=set();current=a
    while any(current) and current not in seen:
     seen.add(current);current=tuple(abs(current[i]-current[(i+1)%n]) for i in range(n))
    self.assertEqual(ducci_kind(a),'LOOP' if any(current) else 'ZERO')
 def test_gaps(self):self.assertEqual(gaps('2\n4\n11\n27\n492170\n1299709\n0\n'),'0\n2\n0\n6\n114\n0\n')
 def test_cantor_grid(self):
  index=0
  for d in range(1,30):
   numerators=range(d,0,-1) if d%2 else range(1,d+1)
   for a in numerators:
    index+=1;self.assertEqual(cantor(str(index)),f'TERM {index} IS {a}/{d+1-a}\n')
 def test_quotes(self):self.assertEqual(quotes('"a\nb" \t ""'),"``a\nb'' \t ``''")
 def test_input_rejections(self):
  for slug,data in [('uva-13185-dpa-numbers-i','1\n1\n'),('uva-1368-dna-consensus-string','1\n3 4\nAAAA\nAAAA\nAAAA\n'),('uva-1585-score','1\n'+('O'*80)+'\n'),('uva-272-tex-quotes','"unclosed')]:
   with self.assertRaises(AssertionError):ORACLES[slug](data)
 def test_generated(self):
  for slug,data in additions().items():self.assertTrue(ORACLES[slug](data))
if __name__=='__main__':unittest.main()
