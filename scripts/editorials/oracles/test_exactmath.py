import unittest,random,itertools,math
from collections import deque
from exactmath import polynomial_coefficients,polynomial_text,bee_numbers,triangle_count,harmonic_floor,distinct_zeroes,min_steps,ORACLES,additions
class ExactMathTests(unittest.TestCase):
 def test_polynomial_subset_coefficients(self):
  rng=random.Random(10326)
  for n in range(1,9):
   for _ in range(40):
    roots=[rng.randrange(-3,4) for _ in range(n)];expected=[(-1)**(n-degree)*sum(math.prod(group) for group in itertools.combinations(roots,n-degree)) for degree in range(n+1)];self.assertEqual(polynomial_coefficients(roots),expected)
    for x in range(-5,6):self.assertEqual(sum(c*x**i for i,c in enumerate(expected)),math.prod(x-r for r in roots))
 def test_polynomial_rendering(self):
  self.assertEqual(polynomial_text(polynomial_coefficients([0,1,-1])),'x^3 - x + 0 = 0');self.assertEqual(polynomial_text(polynomial_coefficients([0])),'x + 0 = 0');self.assertEqual(polynomial_text(polynomial_coefficients([2,3])),'x^2 - 5x + 6 = 0')
 def test_individual_bees_and_bound(self):
  bees=['Q']
  for n in range(12):
   self.assertEqual(bee_numbers(n),(bees.count('M'),len(bees)));next_bees=['Q']
   for bee in bees:
    next_bees.append('M')
    if bee=='M':next_bees.append('F')
   bees=next_bees
  self.assertLessEqual(bee_numbers(44)[1],2**32);self.assertGreater(bee_numbers(45)[1],2**32)
  with self.assertRaises(AssertionError):ORACLES['uva-11000-the-four-in-one-stadium']('45\n-1\n')
 def test_triangles_exhaustive(self):
  for n in range(3,71):self.assertEqual(triangle_count(n),sum(a+b>c for a,b,c in itertools.combinations(range(1,n+1),3)))
 def test_harmonic_direct_sum(self):
  for n in range(-100,1500):self.assertEqual(harmonic_floor(n),sum(n//i for i in range(1,n+1)))
  self.assertEqual(harmonic_floor(-2**31),0);self.assertGreater(harmonic_floor(2**31-1),2**32)
 def test_factorial_plateaus_direct_strings(self):
  zeroes=[]
  for n in range(1,201):s=str(math.factorial(n));zeroes.append(len(s)-len(s.rstrip('0')))
  for low in range(1,201):
   for high in range(low,201):self.assertEqual(distinct_zeroes(low,high),len(set(zeroes[low-1:high])))
  self.assertEqual(distinct_zeroes(24,25),2)
 def test_steps_exhaustive_bfs(self):
  def bfs(distance):
   if distance==0:return 0
   pending=deque([(1,1,1)]);seen={(1,1)}
   while pending:
    position,last,count=pending.popleft()
    if position==distance and last==1:return count
    for step in range(max(0,last-1),last+2):
     state=(position+step,step)
     if state[0]<=distance and state not in seen:seen.add(state);pending.append((*state,count+1))
  for d in range(151):self.assertEqual(min_steps(d),bfs(d))
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
