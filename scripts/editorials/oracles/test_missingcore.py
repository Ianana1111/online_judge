import unittest,itertools,random,math
from missingcore import sumset_value,palindrome_extension,exponent,factorial_sums,prime_sum_counts,ORACLES,additions
class MissingCoreTests(unittest.TestCase):
 def test_sumsets_four_distinct_indices(self):
  rng=random.Random(10125)
  for _ in range(500):
   values=rng.sample(range(-15,16),rng.randrange(1,10));answers=[values[d] for a,b,c,d in itertools.permutations(range(len(values)),4) if values[a]+values[b]+values[c]==values[d]]
   self.assertEqual(sumset_value(values),max(answers) if answers else None)
 def test_palindrome_minimal_exhaustive(self):
  for n in range(1,10):
   for letters in itertools.product('ab',repeat=n):
    s=''.join(letters);expected=next(s+s[:k][::-1] for k in range(n) if (s+s[:k][::-1])==(s+s[:k][::-1])[::-1]);self.assertEqual(palindrome_extension(s),expected)
 def test_powers_explicit_repetition(self):
  for n in range(1,11):
   for letters in itertools.product('a ',repeat=n):
    s=''.join(letters);expected=max(k for k in range(1,n+1) if n%k==0 and s[:n//k]*k==s);self.assertEqual(exponent(s),expected)
 def test_factorial_repeated_addition(self):
  value=1
  for n in range(30):
   if n:value=sum(value for _ in range(n))
   self.assertEqual(int(factorial_sums(str(n))),sum(map(int,str(value))))
  for n in [100,999,1000]:self.assertEqual(int(factorial_sums(str(n)))%9,math.factorial(n)%9)
 def test_prime_sums_trial_list(self):
  primes=[n for n in range(2,301) if all(n%d for d in range(2,math.isqrt(n)+1))];counts=prime_sum_counts()
  for target in range(2,301):self.assertEqual(counts[target],sum(sum(primes[a:b])==target for a in range(len(primes)) for b in range(a+1,len(primes)+1)))
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
