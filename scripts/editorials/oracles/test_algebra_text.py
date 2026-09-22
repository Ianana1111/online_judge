import unittest,math,random,string
from algebra_text import coefficients,compress,uncompress,ORACLES,additions
class AlgebraTextTests(unittest.TestCase):
 def test_all_small_coefficients(self):
  for a in range(1,60):
   for b in range(1,60):
    d=math.gcd(a,b);solutions=[(x,(d-a*x)//b,d) for x in range(-b//d,b//d+1) if (d-a*x)%b==0]
    expected=min(solutions,key=lambda p:(abs(p[0])+abs(p[1]),p[0]>p[1],p))
    self.assertEqual(coefficients(a,b),expected)
 def test_equal_gcd_and_order(self):
  self.assertEqual(coefficients(7,7),(0,1,7));self.assertEqual(coefficients(4,6),(-1,1,2));self.assertEqual(coefficients(6,4),(1,-1,2))
 def test_fixed_roundtrip(self):
  self.assertEqual(uncompress('red blue 2 2\n0\n'),'red blue red blue\n')
  for text in ['', '\n', '\n\n', "Mary's x-ray! A  a A\n", 'X'*50+'\n']:
   self.assertEqual(uncompress(compress(text)),text)
 def test_random_roundtrips(self):
  rng=random.Random(245);vocab=[''.join(rng.choice(string.ascii_letters) for _ in range(rng.randrange(1,51))) for _ in range(60)]
  for _ in range(100):
   text=''.join(rng.choice(vocab)+rng.choice([' ','  ','-','!','\n',"'",'; ']) for _ in range(200))+'\n';self.assertEqual(uncompress(compress(text)),text)
 def test_invalid_dictionary(self):
  for data in ['hello hello\n0\n','word 2\n0\n','x'*51+'\n0\n']:
   with self.assertRaises(AssertionError):uncompress(data)
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
