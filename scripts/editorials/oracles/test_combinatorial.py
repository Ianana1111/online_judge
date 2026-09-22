import unittest,random,itertools,math
from functools import lru_cache
from combinatorial import bitmask,longest,hash_table,expression_range,money_table,ORACLES,additions
class CombinatorialTests(unittest.TestCase):
 def test_masks_all_small_intervals(self):
  for n in range(32):
   for l in range(32):
    for u in range(l,32):self.assertEqual(bitmask(n,l,u),max(range(l,u+1),key=lambda m:(n|m,-m)))
 def test_paths_bruteforce(self):
  rng=random.Random(10000)
  for _ in range(80):
   n=6;order=list(range(1,n+1));rng.shuffle(order);edges={(order[0],v) for v in order[1:]}
   edges|={(order[i],order[j]) for i in range(n) for j in range(i+1,n) if rng.random()<.3};allpaths=[]
   def walk(u,d):
    allpaths.append((d,u))
    for a,b in edges:
     if a==u:walk(b,d+1)
   walk(order[0],0);self.assertEqual(longest(n,order[0],edges),max(allpaths,key=lambda p:(p[0],-p[1])))
 def test_hash_combination_enumeration(self):
  table=hash_table()
  for length in range(1,5):
   counts={}
   for values in itertools.combinations(range(1,27),length):counts[sum(values)]=counts.get(sum(values),0)+1
   for total in range(352):self.assertEqual(table[length,total],counts.get(total,0))
  self.assertEqual(sum(table.values()),2**26);self.assertEqual(table[3,10],4)
 def test_all_parentheses(self):
  for values in itertools.product(range(1,4),repeat=4):
   for ops in itertools.product('+*',repeat=3):
    def possibilities(l,r):
     if l==r:return {values[l]}
     return {a+b if ops[k]=='+' else a*b for k in range(l,r) for a in possibilities(l,k) for b in possibilities(k+1,r)}
    result=possibilities(0,3);self.assertEqual(expression_range(values,ops),(min(result),max(result)))
 def test_money_enumerate_quantities(self):
  coins=(1,2,4,10,20,40);table=money_table()
  def combinations(i,left):
   if i==0:return 1
   return sum(combinations(i-1,left-q*coins[i]) for q in range(left//coins[i]+1))
  for total in range(81):self.assertEqual(table[total],combinations(len(coins)-1,total))
  self.assertEqual(table[4],4);self.assertEqual(table[40],293)
 def test_max_expression_and_format(self):
  self.assertEqual(expression_range([20]*12,['*']*11),(20**12,20**12));self.assertEqual(ORACLES['gpe-22181-dollars']('0.20\n0\n'),'  0.20                4\n')
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
