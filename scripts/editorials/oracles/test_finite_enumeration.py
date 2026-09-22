import unittest,itertools,math,collections
import finite_enumeration as o
class FiniteEnumerationTests(unittest.TestCase):
 def test_prime_block_partitions_against_divisor_recursion(self):
  def visit(rest,minimum):
   options=[]
   for divisor in range(minimum,math.isqrt(rest)+1):
    if rest%divisor==0:
     options.append((divisor,rest//divisor));options.extend((divisor,)+tail for tail in visit(rest//divisor,divisor))
   return sorted(options)
  for n in range(1,1001):
   actual=o.factorizations(n);self.assertEqual(actual,visit(n,2));self.assertEqual(len(actual),len(set(actual)));self.assertTrue(all(math.prod(row)==n for row in actual))
 def test_spy_against_prime_digit_inventory(self):
  primes=[n for n in range(2,10000) if all(n%d for d in range(2,math.isqrt(n)+1))]
  for digits in [''.join(s) for length in range(1,5) for s in itertools.combinations_with_replacement('01279',length)]:
   supply=collections.Counter(digits);expected=sum(all(count<=supply[digit] for digit,count in collections.Counter(str(prime)).items()) for prime in primes);self.assertEqual(o.spy_count(digits),expected)
  self.assertEqual(o.spy_count('011'),2);self.assertFalse(o.is_prime(1));self.assertTrue(o.is_prime(999983))
 def test_three_letter_masks_against_index_triples(self):
  for n in range(1,9):
   for letters in itertools.product('ABC',repeat=n):
    text=''.join(letters);expected={''.join(text[i] for i in indices) for indices in itertools.combinations(range(n),3)};self.assertEqual(o.plate_count(text),len(expected))
  self.assertEqual(o.plates('0\n'),'');self.assertEqual(o.plate_count('ABCDEFGHIJKLMNOPQRSTUVWXYZ'*3),26**3)
 def test_divisor_pairs_against_all_divisors(self):
  counts=o.divisor_counts(1,2000)
  for n in range(1,2001):self.assertEqual(counts[n-1],sum(n%d==0 for d in range(1,n+1)))
  self.assertEqual(o.divisor_counts(1000000000,1000000000),[100]);self.assertEqual(o.divisor_counts(999999937,999999937),[2])
 def test_danger_automaton_against_all_binary_strings(self):
  counts=o.dangerous_counts()
  for n in range(1,16):self.assertEqual(counts[n],sum('UUU' in ''.join(s) for s in itertools.product('LU',repeat=n)))
  data='1\n30\n31\n0\n';expected=f'{counts[1]}\n{counts[30]}\n999\n';self.assertEqual(o.repair_input('uva-580-critical-mass',data,expected),'1\n30\n0\n')
 def test_coin_elimination_against_weight_simulation(self):
  for n in range(2,7):
   weighings=[(set([a]),set([b]),result) for a in range(1,n+1) for b in range(a+1,n+1) for result in '<>=']
   for first,second in itertools.product(weighings,repeat=2):
    candidates=set()
    for fake in range(1,n+1):
     for difference in (-1,1):
      valid=True
      for left,right,result in [first,second]:
       balance=sum(10+(difference if v==fake else 0) for v in left)-sum(10+(difference if v==fake else 0) for v in right);actual='<' if balance<0 else '>' if balance>0 else '=';valid &= actual==result
      if valid:candidates.add(fake)
    self.assertEqual(o.counterfeit_candidates(n,[first,second]),candidates)
  self.assertEqual(o.counterfeit('1\n3 1\n1 1 2\n=\n'),'3\n');self.assertEqual(o.counterfeit('1\n2 1\n1 1 2\n=\n'),'0\n')
if __name__=='__main__':unittest.main()
