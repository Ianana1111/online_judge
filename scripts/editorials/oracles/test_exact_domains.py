import ast,itertools,random,unittest
from fractions import Fraction
from exact_domains import ROOT,BIG,PACK,arithmetic,arithmetic_file,necklace,circle_squared,packing,format_polygons

class ExactDomainTests(unittest.TestCase):
 def test_pratt_and_three_stage_against_python_ast(self):
  code=(ROOT/'content/editorials'/BIG/'python3.py').read_text().split('for line in sys.stdin:')[0];namespace={};exec(compile(code,'arithmetic-reference','exec'),namespace);reference=namespace['calculate']
  def evaluate(node):
   if isinstance(node,ast.Constant):return node.value
   left,right=evaluate(node.left),evaluate(node.right)
   if isinstance(node.op,ast.Add):return left+right
   if isinstance(node.op,ast.Sub):return left-right
   if isinstance(node.op,ast.Mult):return left*right
   return left**right
  for numbers in itertools.product(range(1,4),repeat=3):
   for operators in itertools.product(['+','-','*','**'],repeat=2):
    text=f'{numbers[0]}{operators[0]}{numbers[1]}{operators[1]}{numbers[2]}';wanted=evaluate(ast.parse(text,mode='eval').body)
    self.assertEqual(arithmetic(text),wanted);self.assertEqual(reference(text),wanted)
 def test_capacity_limits_include_intermediates_and_1000_digit_literals(self):
  self.assertEqual(len(str(arithmetic('9**3143'))),3000)
  self.assertEqual(arithmetic('1**'+'9'*1000),1)
  for text in ['9**3144','9**3144-9**3144','1+'+'9'*1001,'10**2','2**0','1 +2','1+'*101+'1']:
   with self.assertRaises(AssertionError,msg=text[:40]):arithmetic(text)
  with self.assertRaises(AssertionError):arithmetic_file('1+1\n'*51)
  self.assertEqual(arithmetic('+'.join(['9'*1000]*101)),101*(10**1000-1))
 def test_bridge_components_against_every_small_cut(self):
  rng=random.Random(1242)
  for n in range(2,8):
   for _ in range(70):
    edges=[tuple(rng.sample(range(n),2)) for _ in range(rng.randrange(1,20))];source,target=rng.sample(range(n),2)
    minimum=min(sum(bool(mask>>a&1)!=bool(mask>>b&1) for a,b in edges) for mask in range(1<<n) if mask>>source&1 and not mask>>target&1)
    self.assertEqual(necklace(n,edges,source,target),minimum>=2)
 def test_parallel_edges_articulation_and_reroute_trap(self):
  self.assertTrue(necklace(2,[(0,1),(0,1)],0,1));self.assertFalse(necklace(2,[(0,1)],0,1))
  self.assertTrue(necklace(6,[(0,1),(1,2),(2,3),(1,4),(4,3),(0,5),(5,2)],0,3))
  self.assertTrue(necklace(5,[(0,1),(1,2),(2,0),(2,3),(3,4),(4,2)],0,4))
 def test_incremental_circle_against_all_supports_and_permutations(self):
  code=(ROOT/'content/editorials'/PACK/'python3.py').read_text().split('tokens = iter(')[0];namespace={};exec(compile(code,'packing-reference','exec'),namespace);reference=namespace['minimum_circle'];rng=random.Random(10005)
  grid=list(itertools.product(range(-3,4),repeat=2))
  for count in range(1,13):
   for _ in range(40):
    points=rng.sample(grid,count);wanted=circle_squared(points)
    for _ in range(3):rng.shuffle(points);self.assertEqual(reference(points)[2],wanted)
 def test_circle_diameter_collinearity_and_exact_decimal_boundaries(self):
  self.assertEqual(circle_squared([(0,0),(4,0),(1,1)]),4)
  self.assertEqual(circle_squared([(0,0),(2,0),(4,0)]),4)
  self.assertEqual(circle_squared([(0,0),(2,0),(0,2)]),2)
  text=format_polygons([([(0,0),(4,0),(1,1)],'2'),([(0,0),(4,0),(1,1)],'1.999999'),([(0,0),(2,0),(0,2)],'1.41421356237309504880'),([(0,0),(2,0),(0,2)],'1.41421356237309504881')])
  self.assertEqual(packing(text).splitlines(),['The polygon can be packed in the circle.','There is no way of packing that polygon.','There is no way of packing that polygon.','The polygon can be packed in the circle.'])
if __name__=='__main__':unittest.main()
