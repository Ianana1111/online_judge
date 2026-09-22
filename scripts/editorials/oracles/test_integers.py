import unittest,random,math
from integers import ORACLES,additions,funny,hotel,love,common,division,guessing,spread,eleven,negative_binary,cola
class IntegerTests(unittest.TestCase):
 def test_funny_nibbles(self):
  table=[0,1,1,2,1,2,2,3,1,2]
  for n in range(1,10000,13):
   b1,b2=map(int,funny(f'1\n{n}\n').split());self.assertEqual(b2,sum(table[int(ch)] for ch in str(n)));self.assertEqual(b1,bin(n).count('1'))
 def test_hotel_simulated(self):
  for start in range(1,30):
   size=start;remaining=start
   for day in range(1,300):
    self.assertEqual(hotel(f'{start} {day}').strip(),str(size));remaining-=1
    if remaining==0:size+=1;remaining=size
 def test_love_common_divisors(self):
  for a in range(2,40):
   for b in range(2,40):
    yes=any(a%d==0 and b%d==0 for d in range(2,min(a,b)+1))
    self.assertEqual(love(f'1\n{a:b}\n{b:b}\n').strip(), 'Pair #1: '+('All you need is love!' if yes else 'Love is not all you need!'))
 def test_common_empty_pairs(self):self.assertEqual(common('\n\n\nabc\nabc\n\nba\nab\nabbc\nbccc\n'),'\n\n\nab\nbc\n')
 def test_division_bruteforce(self):
  rng=random.Random(10407)
  for _ in range(100):
   a=rng.sample([i for i in range(-30,31) if i],5);largest=max(d for d in range(1,max(a)-min(a)+1) if len({x%d for x in a})==1)
   self.assertEqual(division(' '.join(map(str,a))+' 0\n0\n').strip(),str(largest))
 def test_guess_bounds_and_reset(self):self.assertEqual(guessing('3\ntoo high\n9\ntoo high\n5\nright on\n5\nright on\n0\n'),'Stan is dishonest\nStan may be honest\n')
 def test_score_equations_exhaustive(self):
  for s in range(31):
   for d in range(31):
    candidates=[(a,b) for a in range(s+1) for b in range(a+1) if a+b==s and a-b==d]
    expected=f'{candidates[0][0]} {candidates[0][1]}' if candidates else 'impossible'
    self.assertEqual(spread(f'1\n{s} {d}').strip(),expected)
 def test_eleven_native(self):
  for n in range(1,500):self.assertEqual(' is a multiple' in eleven(f'{n}\n0\n'),n%11==0)
 def test_negative_base_decode(self):
  for n in list(range(-3000,3001))+[-10**9,10**9]:
   bits=negative_binary(n);self.assertTrue(bits=='0' or bits[0]=='1');self.assertEqual(sum(int(ch)*(-2)**i for i,ch in enumerate(reversed(bits))),n)
 def test_cola_borrowing(self):
  for n in range(1,201):
   choices=[]
   for borrowed in range(10):
    empty=n+borrowed;drinks=n
    while empty>=3:empty-=2;drinks+=1
    if empty>=borrowed:choices.append(drinks)
   self.assertEqual(int(cola(str(n))),max(choices))
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
