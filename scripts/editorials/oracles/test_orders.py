import unittest,itertools,random
from orders import exchange,inversion_count,frog_distance,antimonotone,classify,ORACLES,additions
class OrderTests(unittest.TestCase):
 def test_exchange_exact_pairing(self):
  def pairable(a):
   if not a:return True
   x,y=a[0]
   return any(a[i]==(y,x) and pairable(a[1:i]+a[i+1:]) for i in range(1,len(a)))
  rng=random.Random(10763)
  for _ in range(300):
   a=[tuple(rng.sample(range(4),2)) for _ in range(rng.randrange(1,10))]
   data=str(len(a))+'\n'+''.join(f'{x} {y}\n' for x,y in a)+'0\n'
   self.assertEqual(exchange(data).strip()=='YES',pairable(a))
 def test_inversions_all_small_permutations(self):
  for n in range(1,8):
   for a in itertools.permutations(range(n)):self.assertEqual(inversion_count(a),sum(a[i]>a[j] for i in range(n) for j in range(i+1,n)))
 def test_frog_path_partition(self):
  for n in range(6):
   for kinds in itertools.product('BS',repeat=n):
    stones=list(zip(kinds,range(1,n+1)));small=[p for t,p in stones if t=='S'];big=[p for t,p in stones if t=='B'];d=n+1;best=d
    for mask in range(1<<len(small)):
     routes=[sorted([0,d]+big+[p for j,p in enumerate(small) if ((mask>>j)&1)==side]) for side in [0,1]]
     best=min(best,max(b-a for path in routes for a,b in zip(path,path[1:])))
    self.assertEqual(frog_distance(stones,d),best)
 def test_alternation_exhaustive_subsequences(self):
  for n in range(1,7):
   for a in itertools.permutations(range(1,n+1)):
    best=1
    for mask in range(1,1<<n):
     b=[a[i] for i in range(n) if mask>>i&1]
     if all((b[i]>b[i+1])==(i%2==0) for i in range(len(b)-1)):best=max(best,len(b))
    self.assertEqual(antimonotone(a),best)
 def test_container_exact_labels(self):
  self.assertEqual(classify([(2,1)]),'impossible')
  self.assertEqual(classify([(1,2),(1,3),(1,1),(2,3)]),'priority queue')
  self.assertEqual(classify([(1,2),(1,3),(1,1),(2,1),(2,3),(2,2)]),'stack')
  self.assertEqual(classify([(1,2),(1,3),(1,1),(2,2),(2,3),(2,1)]),'queue')
  self.assertEqual(classify([(1,1),(1,1),(2,1),(2,1)]),'not sure')
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
