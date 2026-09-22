import itertools,random,subprocess,tempfile,unittest
from decimal import Decimal,localcontext
from fractions import Fraction
from pathlib import Path
from rational_shapes import ROOT,CENTER,HAY,HUFF,centroid,hull,salary_rows,salary_matches,flood_values,huffman,format_huffman,huffman_rows,matches,render,decimal_coefficient,finite_text

class RationalShapeTests(unittest.TestCase):
 def test_centroid_triangle_and_affine_invariance(self):
  rng=random.Random(10002)
  source=(ROOT/'content/editorials'/CENTER/'python3.py').read_text().split('tokens = iter(')[0];namespace={};exec(compile(source,'centroid-reference','exec'),namespace)
  self.assertEqual(centroid([(0,0),(4,0),(2,2),(0,2)]),(Fraction(14,9),Fraction(8,9)))
  for _ in range(200):
   points=hull(rng.sample(list(itertools.product(range(-10,11),repeat=2)),10));x,y=centroid(points);changed=[(2*a+3*b+7,-a+2*b-11) for a,b in points];self.assertEqual(centroid(changed),(2*x+3*y+7,-x+2*y-11));rng.shuffle(points)
   output=' '.join(namespace['centroid'](points));self.assertTrue(matches([[(x,3),' ',(y,3)]],output))
 def test_decimal_coefficient_and_fraction_output_against_decimal(self):
  source=(ROOT/'content/editorials'/HAY/'python3.py').read_text().split('tokens = iter(')[0];namespace={};exec(compile(source,'salary-reference','exec'),namespace)
  with localcontext() as context:
   context.prec=100
   for text in ['0','1.25e-3','999999.999999','0.000000000001','1000000','.125','0001.2000','1e6']:
    coefficient,scale=decimal_coefficient(text);canonical=finite_text(coefficient,scale);self.assertEqual(Decimal(canonical),Decimal(text));self.assertEqual(Decimal(namespace['decimal_string'](Fraction(text))),Decimal(text))
  rows=salary_rows('3 2\na 0.1\nb 0.2\nzero 0\na a b\n.\nunknown 123 zero\n.\n');self.assertTrue(salary_matches(rows,'0.400\n0e20'))
  self.assertFalse(salary_matches(rows,'0.3\n0'))
 def test_hydraulic_volume_and_strict_boundary(self):
  self.assertEqual(flood_values([0,10],1000),(10,50));self.assertEqual(flood_values([-10,-10],0),(-10,0));self.assertEqual(flood_values([-10,-10],1),(Fraction(-1999,200),100))
  rng=random.Random(815)
  for _ in range(500):
   heights=[rng.randrange(-100,101) for _ in range(rng.randrange(1,30))];water=rng.randrange(100000);level,percentage=flood_values(heights,water)
   self.assertEqual(sum(max(Fraction(0),level-h)*100 for h in heights),water);self.assertEqual(percentage,Fraction(sum(h<level for h in heights)*100,len(heights)))
   shifted,pct=flood_values([h+123 for h in heights],water);self.assertEqual(shifted,level+123);self.assertEqual(pct,percentage)
 def test_huffman_matches_exhaustive_merge_cost(self):
  from functools import lru_cache
  @lru_cache(None)
  def optimum(radix,weights):
   if len(weights)==1:return 0
   best=None
   for choice in itertools.combinations(range(len(weights)),radix):
    chosen=set(choice);weight=sum(weights[i] for i in choice);rest=tuple(sorted([x for i,x in enumerate(weights) if i not in chosen]+[weight]));value=weight+optimum(radix,rest);best=value if best is None else min(best,value)
   return best
  rng=random.Random(240)
  for radix in range(2,5):
   for _ in range(25):
    frequencies=[rng.randrange(1,5) for _ in range(rng.randrange(2,7))];codes,average=huffman(radix,frequencies);weights=list(frequencies)
    while len(weights)<radix or (len(weights)-1)%(radix-1):weights.append(0)
    self.assertEqual(average*sum(frequencies),optimum(radix,tuple(sorted(weights))))
    self.assertTrue(all(not b.startswith(a) for i,a in enumerate(codes) for j,b in enumerate(codes) if i!=j))
    self.assertLessEqual(sum(Fraction(1,radix**len(code)) for code in codes),1)
 def test_canonical_huffman_codes_match_independent_sorted_forest(self):
  source=(ROOT/'content/editorials'/HUFF/'cpp17.cpp').read_text().replace('#include <bits/stdc++.h>','#include <iostream>\n#include <vector>\n#include <string>\n#include <queue>\n#include <functional>\n#include <algorithm>\n#include <climits>\n#include <utility>')
  cases=[(radix,list(frequencies)) for radix in range(2,5) for n in range(2,7) for frequencies in itertools.product(range(1,4),repeat=n)]
  with tempfile.TemporaryDirectory() as directory:
   path=Path(directory);(path/'main.cpp').write_text(source);subprocess.run(['c++','-std=c++17','-O2',str(path/'main.cpp'),'-o',str(path/'reference')],check=True,capture_output=True)
   data=format_huffman(cases);result=subprocess.run([str(path/'reference')],input=data,text=True,capture_output=True,check=True);self.assertTrue(matches(huffman_rows(data),result.stdout))
if __name__=='__main__':unittest.main()
