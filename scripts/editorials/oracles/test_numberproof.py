import unittest
from numberproof import lights,modular,matrix_fibonacci,additions,ORACLES
class NumberProofTests(unittest.TestCase):
 def test_switches(self):
  for n in range(1,400):
   state=False
   for step in range(1,n+1):
    if n%step==0:state=not state
   self.assertEqual(lights(f'{n}\n0\n').strip(),'yes' if state else 'no')
 def test_large_squares(self):
  self.assertEqual(lights('4294836225\n4294836224\n4294836226\n4294967295\n0\n'),'yes\nno\nno\nno\n')
 def test_linear_recurrence(self):
  a,b=0,1
  for n in range(150):
   for m in range(20):self.assertEqual(matrix_fibonacci(n,2**m),a%(2**m))
   a,b=b,a+b
 def test_zero_is_data(self):self.assertEqual(modular('0 0\n1 0\n10 3\n'),'0\n0\n7\n')
 def test_illegal_input(self):
  for text in ['0\n1\n0\n','4294967296\n0\n']:
   with self.assertRaises(AssertionError):lights(text)
  with self.assertRaises(AssertionError):modular('1 20\n')
 def test_generated(self):
  for slug,data in additions().items():self.assertTrue(ORACLES[slug](data))
if __name__=='__main__':unittest.main()
