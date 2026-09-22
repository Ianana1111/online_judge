import collections,itertools,math,random,unittest
from fractions import Fraction
from rational_surfaces import portion_cost,lcm_sum,surface_area,flight,vertex_safety
class RationalSurfaceTests(unittest.TestCase):
 def test_portion_lattice_against_all_visit_allocations(self):
  rng=random.Random(11633)
  for _ in range(120):
   values=[rng.randint(1,20) for i in range(rng.randint(1,6))];a,b=rng.randint(1,10),rng.randint(1,10);best=None
   for visits in itertools.product(range(1,4),repeat=len(values)):
    size=max(Fraction(y,k) for y,k in zip(values,visits));cost=a*(size*sum(visits)-sum(values))+b*sum(visits)
    if best is None or cost<best:best=cost
   self.assertEqual(portion_cost(a,b,values),best)
  self.assertEqual(portion_cost(1,1,[3,7,1,9,12]),Fraction(35,2));self.assertEqual(portion_cost(10,1,[11,13,17]),Fraction(154,3))
 def test_lcm_pairs_against_divisor_pair_enumeration(self):
  for n in range(2,500):
   remaining=n;factors=[];p=2
   while p*p<=remaining:
    exponent=0
    while remaining%p==0:remaining//=p;exponent+=1
    if exponent:factors.append((p,exponent))
    p+=1
   if remaining>1:factors.append((remaining,1))
   divisors=[v for v in range(1,n+1) if n%v==0];expected=sum(a+b for a in divisors for b in divisors if a<=b and a*b//math.gcd(a,b)==n);self.assertEqual(lcm_sum(factors),expected)
 def test_surface_hierarchy_against_all_pair_contacts(self):
  def brute(rects):
   seen=set();answer=0
   def touching(a,b):
    x,y,w,h=a;u,v,s,t=b;return max(x,u)<=min(x+w,u+s) and max(y,v)<=min(y+h,v+t)
   for root in range(len(rects)):
    if root in seen:continue
    seen.add(root);queue=[root];area=0
    while queue:
     u=queue.pop();area+=rects[u][2]*rects[u][3]
     for v in range(len(rects)):
      if v not in seen and touching(rects[u],rects[v]):seen.add(v);queue.append(v)
    answer=max(answer,area)
   return answer
  rng=random.Random(12882)
  for _ in range(150):
   rects=[(x*4,y*4,rng.randint(1,4),rng.randint(1,4)) for x in range(6) for y in range(6) if rng.random()<.6];self.assertEqual(surface_area(rects),brute(rects))
  self.assertEqual(surface_area([(0,0,1,1),(1,1,1,1)]),2)
  with self.assertRaises(AssertionError):surface_area([(0,0,2,2),(1,1,2,2)])
 def test_flights_near_double_precision_and_average(self):
  win,value=flight(999999999,999999998,1000000000,999999999);self.assertTrue(win);self.assertEqual(float(Fraction(999999998,999999999)),float(Fraction(999999999,1000000000)));self.assertEqual(value,Fraction(999999998,999999999)/2+Fraction(999999999,1000000000)/2)
  self.assertEqual(flight(4,7,4,9),(True,Fraction(2)))
 def test_vertex_cuts_against_all_removed_subsets(self):
  def brute(n,edges):
   for count in range(n+1):
    for removed in itertools.combinations(range(n),count):
     left=set(range(n))-set(removed)
     if not left:continue
     reached={next(iter(left))};changed=True
     while changed:
      changed=False
      for u,v in edges:
       if u in left and v in left and (u in reached)!=(v in reached):reached|={u,v};changed=True
     if reached!=left:return count
   return n
  for n in range(6):
   options=list(itertools.combinations(range(n),2))
   for mask in range(1<<len(options)):
    edges=[edge for i,edge in enumerate(options) if mask>>i&1];self.assertEqual(vertex_safety(n,edges),brute(n,edges))
if __name__=='__main__':unittest.main()
