import unittest,itertools,random,math
from gpecore import last_digit,product_value,bricks,salutations,conformity,cutting_cost,ORACLES,additions
class GPECoreTests(unittest.TestCase):
 def test_power_sum_direct(self):
  total=0
  for n in range(1,500):
   total+=pow(n,n);self.assertEqual(int(last_digit(f'{n}\n0\n')),total%10)
 def test_product_all_short_sequences(self):
  for n in range(1,7):
   for a in itertools.product([-2,0,3],repeat=n):self.assertEqual(product_value(a),max([0]+[math.prod(a[i:j]) for i in range(n) for j in range(i+1,n+1)]))
 def test_bricks_board_fill(self):
  def tile(mask,n):
   if mask==(1<<(2*n))-1:return 1
   cell=next(i for i in range(2*n) if not mask>>i&1);row,col=divmod(cell,n);total=0
   for other in ([cell+n] if row==0 else [])+([cell+1] if col+1<n else []):
    if not mask>>other&1:total+=tile(mask|(1<<cell)|(1<<other),n)
   return total
  for n in range(1,9):self.assertEqual(int(bricks(f'{n}\n0\n')),tile(0,n))
 def test_handshake_explicit_matchings(self):
  def all_pairs(points):
   if not points:yield [];return
   for j in range(1,len(points)):
    for rest in all_pairs(points[1:j]+points[j+1:]):yield [(points[0],points[j])]+rest
  for n in range(1,6):
   count=0
   for pairs in all_pairs(list(range(2*n))):
    if not any(a<c<b<d or c<a<d<b for (a,b),(c,d) in itertools.combinations(pairs,2)):count+=1
   self.assertEqual(int(salutations(str(n))),count)
 def test_conformity_ties(self):
  self.assertEqual(conformity('4\n100 101 102 103 104\n104 103 102 101 100\n110 111 112 113 114\n114 113 112 111 110\n0\n'),'4\n')
 def test_cutting_actual_orders(self):
  rng=random.Random(10003)
  for _ in range(80):
   length=rng.randrange(2,30);cuts=sorted(rng.sample(range(1,length),rng.randrange(min(7,length))));best=10**9
   for order in itertools.permutations(cuts):
    ends=[0,length];cost=0
    for point in order:
     cost+=min(x for x in ends if x>point)-max(x for x in ends if x<point);ends.append(point)
    best=min(best,cost)
   self.assertEqual(cutting_cost(length,cuts),best)
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
