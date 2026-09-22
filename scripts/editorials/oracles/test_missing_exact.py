import itertools,math,random,unittest
from missing_exact import is_smith,next_smith,joseph_survivor,roots,next_palindrome_time,equalization,alphabet_order
class MissingExactTests(unittest.TestCase):
 def test_smith_factor_multiplicity_and_compositeness(self):
  sums=[0]*10001;counts=[0]*10001
  for n in range(2,10001):
   divisor=next((d for d in range(2,math.isqrt(n)+1) if n%d==0),n);sums[n]=sum(map(int,str(divisor)))+sums[n//divisor];counts[n]=1+counts[n//divisor];self.assertEqual(is_smith(n),counts[n]>1 and sums[n]==sum(map(int,str(n))))
  self.assertTrue(is_smith(4937775));self.assertFalse(is_smith(13));self.assertEqual(next_smith(4),22);self.assertEqual(next_smith(21),22);self.assertEqual(next_smith(22),27)
 def test_joseph_direct_list_elimination(self):
  primes=[n for n in range(2,1300) if all(n%d for d in range(2,math.isqrt(n)+1))]
  for n in range(1,201):
   circle=list(range(1,n+1));position=0
   for p in primes[:n-1]:position=(position+p-1)%len(circle);circle.pop(position)
   self.assertEqual(joseph_survivor(n),circle[0])
  self.assertEqual(joseph_survivor(6),4)
 def test_square_root_legal_input_domain(self):
  values=[1,2,3,99,10**500,10**500-1];self.assertEqual(roots(str(len(values))+'\n\n'+'\n\n'.join(str(x*x) for x in values)),'\n\n'.join(map(str,values))+'\n')
  for illegal in ['0','2','01',str(10**1002)]:
   with self.assertRaises(AssertionError):roots('1\n'+illegal)
 def test_clock_strict_successor_and_leading_zero_rule(self):
  for before,after in [('00:00','00:01'),('00:09','00:11'),('00:59','01:01'),('09:59','10:01'),('14:59','15:51'),('23:32','00:00'),('23:59','00:00')]:
   h,m=map(int,before.split(':'));self.assertEqual(next_palindrome_time(h*60+m),after)
  valid=[]
  for minute in range(1440):
   number=100*(minute//60)+minute%60;digits=[]
   while number:digits.append(number%10);number//=10
   if digits==digits[::-1]:valid.append(minute)
  for minute in range(1440):
   selected=min(((candidate-minute)%1440 or 1440,candidate) for candidate in valid)[1];self.assertEqual(next_palindrome_time(minute),f'{selected//60:02}:{selected%60:02}')
 def test_trip_all_cent_assignments(self):
  rng=random.Random(10137)
  for n in range(1,9):
   for _ in range(60):
    expenses=[rng.randrange(101) for _ in range(n)];low,r=divmod(sum(expenses),n);best=10**9
    for higher in itertools.combinations(range(n),r):
     higher=set(higher);targets=[low+(i in higher) for i in range(n)];cost=sum(max(0,a-b) for a,b in zip(expenses,targets));self.assertEqual(cost,sum(max(0,b-a) for a,b in zip(expenses,targets)));best=min(best,cost)
    self.assertEqual(equalization(expenses),best)
 def test_inverse_rank_all_permutations(self):
  for n in range(1,8):
   alphabet='gfedcba'[:n]
   for rank,permutation in enumerate(itertools.permutations(alphabet),1):self.assertEqual(alphabet_order(''.join(permutation),rank),alphabet)
  self.assertEqual(alphabet_order('bdac',11),'abcd');self.assertEqual(alphabet_order('abcd',5),'acdb');self.assertEqual(alphabet_order('abcdefghijklmnopqrst',math.factorial(20)),'tsrqponmlkjihgfedcba')
if __name__=='__main__':unittest.main()
