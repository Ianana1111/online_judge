import collections,itertools,math,random,unittest
from functools import lru_cache
from rank_digits import almost_count,integer_root,schedule,approximate_period,digit_counts,cheapest_coordinate,signature_count,MOD
class RankDigitsTests(unittest.TestCase):
 def test_prime_powers_against_factorization(self):
  count=0
  for n in range(1,3001):
   remaining=n;primes=0;exponents=0;d=2
   while d*d<=remaining:
    if remaining%d==0:
     primes+=1
     while remaining%d==0:remaining//=d;exponents+=1
    d+=1
   if remaining>1:primes+=1;exponents+=1
   count+=primes==1 and exponents>=2
   if n%29==0 or n==3000:self.assertEqual(almost_count(1,n),count)
  for root in [2,3,97,999983]:
   for e in range(2,10):
    self.assertEqual(integer_root(root**e,e),root);self.assertEqual(integer_root(root**e-1,e),root-1)
 def test_argus_against_time_tick(self):
  rng=random.Random(1203)
  for _ in range(100):
   queries=[(q,rng.randint(1,10)) for q in rng.sample(range(1,31),rng.randint(1,12))];k=rng.randint(1,200);events=[];time=0
   while len(events)<k:
    time+=1;events.extend(sorted(q for q,p in queries if time%p==0))
   self.assertEqual(schedule(queries,k),events[:k])
 def test_period_minimax_against_all_partitions_and_threshold_dp(self):
  @lru_cache(None)
  def edit(a,b):
   if not a:return len(b)
   if not b:return len(a)
   return min(edit(a[1:],b)+1,edit(a,b[1:])+1,edit(a[1:],b[1:])+(a[0]!=b[0]))
  def threshold(y,x,k):
   m=len(y);previous=list(range(m+1));possible=False
   for ch in x:
    current=[previous[0]+1]
    for j in range(1,m+1):current.append(min(previous[j]+1,current[-1]+1,previous[j-1]+(ch!=y[j-1])))
    possible=current[m]<=k
    if possible:current=[min(v,j) for j,v in enumerate(current)]
    previous=current
   return possible
  strings=[''.join(bits) for n in range(1,7) for bits in itertools.product('ab',repeat=n)]
  for y in ['a','b','aa','ab','ba','bb','aba']:
   for x in strings:
    expected=len(y)
    for cuts in range(1<<(len(x)-1)):
     boundaries=[0]+[i+1 for i in range(len(x)-1) if cuts>>i&1]+[len(x)];expected=min(expected,max(edit(y,x[a:b]) for a,b in zip(boundaries,boundaries[1:])))
    self.assertEqual(approximate_period(y,x),expected)
    for k in range(len(y)+1):self.assertEqual(threshold(y,x,k),k>=expected)
 def test_digit_dp_by_literal_strings(self):
  count=[0]*10
  for n in range(1,2001):
   for ch in str(n):count[int(ch)]+=1
   if n<101 or n%37==0:self.assertEqual(digit_counts(n),tuple(count))
  for k in range(1,9):self.assertEqual(sum(digit_counts(10**k-1)),sum(9*10**(j-1)*j for j in range(1,k+1)))
 def test_grid_cost_against_every_corner(self):
  rng=random.Random(855)
  for _ in range(100):
   s,a=rng.randint(1,8),rng.randint(1,8);points=[(rng.randint(1,s),rng.randint(1,a)) for _ in range(rng.randint(1,20))];best=min((sum(abs(x-u)+abs(y-v) for u,v in points),x,y) for x in range(1,s+1) for y in range(1,a+1));self.assertEqual((cheapest_coordinate([x for x,y in points],s),cheapest_coordinate([y for x,y in points],a)),best[1:])
 def test_signature_inclusion_exclusion_by_permutations(self):
  for n in range(1,7):
   counts=collections.Counter(''.join('I' if p[i]<p[i+1] else 'D' for i in range(n)) for p in itertools.permutations(range(n+1)))
   for pattern in itertools.product('ID?',repeat=n):
    s=''.join(pattern);expected=sum(count for signature,count in counts.items() if all(a=='?' or a==b for a,b in zip(s,signature)));self.assertEqual(signature_count(s),expected)
  self.assertEqual(signature_count('?'*1000),math.factorial(1001)%MOD)
  self.assertEqual(signature_count('I'*1000),1);self.assertEqual(signature_count('D'*1000),1)
if __name__=='__main__':unittest.main()
