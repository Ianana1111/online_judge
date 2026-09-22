import unittest,random,re
from itertools import permutations,product
from formatting import ORACLES,additions,trains,maya,hint,mastermind,bases,polynomial,palindromes,periods,decoder,scramble,kindergarten,repair_input
class FormattingTests(unittest.TestCase):
 def test_train_exhaustive(self):
  for n in range(6):
   for a in permutations(range(1,n+1)):
    inversions=sum(a[i]>a[j] for i in range(n) for j in range(i+1,n))
    self.assertEqual(trains('1\n'+str(n)+'\n'+' '.join(map(str,a))+'\n'),f'Optimal train swapping takes {inversions} swaps.\n')
 def test_calendar(self):self.assertEqual(maya('4\n0. pop 0\n13. pop 0\n0. kankin 0\n4. uayet 0\n'),'4\n1 imix 0\n1 ix 0\n1 imix 1\n1 chicchan 1\n')
 def test_hint_exhaustive_matching(self):
  for secret in product(range(1,4),repeat=3):
   for guess in product(range(1,4),repeat=3):
    total,strong=max((sum(secret[i]==guess[j] for i,j in enumerate(p)),sum(i==j and secret[i]==guess[j] for i,j in enumerate(p))) for p in permutations(range(3)))
    self.assertEqual(hint(secret,guess),(strong,total-strong))
 def test_hint_format(self):self.assertEqual(mastermind('1\n5\n5\n3\n0\n0\n'),'Game 1:\n    (1,0)\n    (0,0)\n')
 def test_local_bases(self):self.assertEqual(bases('120 10 16\n128 10 2\n127 10 2\n0000 2 16\nFFFFFFFFFFFFFFFFFFFFFFFF 16 16\n'),'0000078\n0000000\n1111111\n0000000\nFFFFFFF\n')
 def test_polynomial_render_and_evaluate(self):
  rng=random.Random(392)
  for _ in range(50):
   coefficients=[rng.choice([-999,-1,0,1,999]) for _ in range(9)]
   rendered=polynomial(' '.join(map(str,coefficients))).strip().replace(' ','')
   terms=re.findall('[+-]?[^+-]+',rendered)
   for x in [-3,-1,0,1,2]:
    total=0
    for term in terms:
     if 'x' not in term:total+=int(term);continue
     left,right=term.split('x');c=-1 if left=='-' else 1 if left in ['', '+'] else int(left);power=int(right[1:]) if right else 1;total+=c*x**power
    self.assertEqual(total,sum(c*x**degree for c,degree in zip(coefficients,range(8,-1,-1))))
  self.assertEqual(polynomial('0 0 0 0 0 0 -1 1 -1'),'-x^2 + x - 1\n')
  self.assertEqual(polynomial('0 '*8+'0'),'0\n')
 def test_mirror_categories_and_center(self):
  self.assertEqual(palindromes('A\nB\nE3\nAB\nE\n3E\n'),"A -- is a mirrored palindrome.\n\nB -- is a regular palindrome.\n\nE3 -- is a mirrored string.\n\nAB -- is not a palindrome.\n\nE -- is a regular palindrome.\n\n3E -- is a mirrored string.\n\n")
 def test_periods(self):self.assertEqual(periods('4\n\naaaa\n\nababa\n\nabcabc\n\nx\n'),'1\n\n5\n\n3\n\n1\n')
 def test_decoder_lookup_roundtrip(self):
  for code in range(32,127):
   plain=code-7 if code>=39 else code+88
   self.assertEqual(decoder(chr(code)),chr(plain))
  self.assertEqual(decoder("JKL'5\n"),'CDE .\n')
 def test_scramble_separator_identity(self):
  text="ab  cd\tWe're\n\nlast";answer=scramble(text)
  self.assertEqual(answer,"ba  dc\ter'eW\n\ntsal")
  self.assertEqual(re.findall(r'\s+',answer),re.findall(r'\s+',text))
 def test_words(self):self.assertEqual(kindergarten("Hello,world42ABC\ndon't\na---B\n"),'3\n2\n2\n')
 def test_illegal_input(self):
  for slug,data in [('uva-299-train-swapping','1\n3\n1 1 3\n'),('uva-300-maya-calendar','1\n5. uayet 0\n'),('uva-494-kindergarten-counting-game','123 !\n'),('uva-401-palindromes','0\n')]:
   with self.assertRaises(AssertionError):ORACLES[slug](data)
  self.assertIsNone(repair_input('uva-494-kindergarten-counting-game','123 !\n'))
 def test_generated(self):
  for slug,data in additions().items():self.assertTrue(ORACLES[slug](data))
if __name__=='__main__':unittest.main()
