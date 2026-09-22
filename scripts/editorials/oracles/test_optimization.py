import unittest,itertools,random
from optimization import signed_minimum,job_order,product,grouped_knapsack,ORACLES,additions
class OptimizationTests(unittest.TestCase):
 def test_signed_minima_from_all_reachable_sums(self):
  sums={0};first={}
  for n in range(1,50):
   sums={s+sign*n for s in sums for sign in [-1,1]}
   for s in sums:first.setdefault(s,n)
  for k in range(-300,301):self.assertEqual(signed_minimum(k),first[k])
 def test_job_order_all_schedules(self):
  rng=random.Random(10026)
  for _ in range(80):
   jobs=[(rng.randrange(1,10),rng.randrange(1,10)) for _ in range(rng.randrange(1,7))]
   def cost(order):
    elapsed=total=0
    for i in order:total+=elapsed*jobs[i][1];elapsed+=jobs[i][0]
    return total
   expected=min(itertools.permutations(range(len(jobs))),key=lambda order:(cost(order),order))
   self.assertEqual(tuple(job_order(jobs)),expected)
 def test_products_repeated_addition(self):
  for a in range(31):
   for b in range(31):self.assertEqual(int(product(f'{a}\n{b}\n')),sum(a for _ in range(b)))
 def test_large_product_modular_identities(self):
  a=int('9'*250);b=10**249;answer=int(product(f'{a}\n{b}\n'))
  for prime in [97,1009,65537]:self.assertEqual(answer%prime,(a%prime)*(b%prime)%prime)
 def test_grouped_knapsack_all_subsets(self):
  rng=random.Random(10130)
  for _ in range(100):
   items=[(rng.randrange(1,101),rng.randrange(1,31)) for _ in range(rng.randrange(1,11))];best=[0]*31
   for mask in range(1<<len(items)):
    value=sum(p for i,(p,w) in enumerate(items) if mask>>i&1);weight=sum(w for i,(p,w) in enumerate(items) if mask>>i&1)
    for cap in range(weight,31):best[cap]=max(best[cap],value)
   self.assertEqual(grouped_knapsack(items),best)
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
