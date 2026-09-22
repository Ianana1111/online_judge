import unittest,itertools,random
from matrixsets import rectangle,wall_from_clues,credit_value,highest,lazy_matrix,inversion_count,bars_possible,ORACLES,additions,repair_input
class MatrixSetTests(unittest.TestCase):
 def test_rectangles_direct_cells(self):
  rng=random.Random(108)
  for n in range(1,6):
   for _ in range(30):
    a=[[rng.randrange(-9,10) for _ in range(n)] for _ in range(n)];expected=max(sum(a[r][c] for r in range(top,bottom) for c in range(left,right)) for top in range(n) for bottom in range(top+1,n+1) for left in range(n) for right in range(left+1,n+1));self.assertEqual(rectangle(a),expected)
 def test_wall_roundtrip(self):
  rng=random.Random(11040)
  for _ in range(200):
   rows=[[rng.randrange(-1000,1001) for _ in range(9)]]
   for _ in range(8):rows.append([a+b for a,b in zip(rows[-1],rows[-1][1:])])
   rows.reverse();clues=[v for row in rows[::2] for v in row[::2]];self.assertEqual(wall_from_clues(clues),rows)
 def test_ordered_difference_all_pairs(self):
  for n in range(2,7):
   for a in itertools.product(range(-1,2),repeat=n):self.assertEqual(credit_value(a),max(a[i]-a[j] for i in range(n) for j in range(i+1,n)))
 def test_building_all_subsets(self):
  rng=random.Random(11039)
  for _ in range(100):
   values=[v*rng.choice([-1,1]) for v in rng.sample(range(1,100),9)];ordered=sorted(values,key=abs);answer=0
   for mask in range(1<<len(values)):
    chosen=[x for i,x in enumerate(ordered) if mask>>i&1]
    if all(a*b<0 for a,b in zip(chosen,chosen[1:])):answer=max(answer,len(chosen))
   self.assertEqual(highest(values),answer)
 def test_lazy_vs_direct_matrix(self):
  rng=random.Random(11360)
  for _ in range(100):
   n=5;original=[[rng.randrange(10) for _ in range(n)] for _ in range(n)];a=[r[:] for r in original];commands=[]
   for _ in range(49):
    op=rng.choice(['row','col','inc','dec','transpose']);command=[op]
    if op in ('row','col'):
     i,j=rng.sample(range(n),2);command.extend([str(i+1),str(j+1)])
     if op=='row':a[i],a[j]=a[j],a[i]
     else:
      for r in a:r[i],r[j]=r[j],r[i]
    elif op=='transpose':a=[list(r) for r in zip(*a)]
    else:a=[[(x+(1 if op=='inc' else -1))%10 for x in row] for row in a]
    commands.append(command);self.assertEqual(lazy_matrix(original,commands),a)
 def test_inversions_all_small_permutations(self):
  for n in range(2,8):
   for a in itertools.permutations(range(1,n+1)):
    ordered,moves=inversion_count(a);self.assertEqual(ordered,list(range(1,n+1)));self.assertEqual(moves,sum(a[i]>a[j] for i in range(n) for j in range(i+1,n)))
 def test_bar_all_subsets(self):
  rng=random.Random(12455)
  for _ in range(100):
   a=[rng.randrange(1,31) for _ in range(rng.randrange(1,12))];sums={sum(v for i,v in enumerate(a) if mask>>i&1) for mask in range(1<<len(a))}
   for target in range(50):self.assertEqual(bars_possible(target,a),target in sums)
  self.assertEqual(ORACLES['uva-12455-bars']('0\n'),'')
 def test_misplaced_duplicate_operations(self):
  data='1\n2\n01\n23\ntranspose\nrow 1 2\n2\ntranspose\nrow 1 2\n';fixed=repair_input('uva-11360-having-fun-with-matrices',data);self.assertEqual(fixed,'1\n2\n01\n23\n2\ntranspose\nrow 1 2\n');self.assertEqual(ORACLES['uva-11360-having-fun-with-matrices'](fixed),'Case #1\n13\n02\n\n')
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
