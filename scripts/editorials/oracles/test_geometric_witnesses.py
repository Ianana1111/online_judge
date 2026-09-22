import itertools,random,subprocess,tempfile,unittest
from decimal import Decimal,localcontext
from pathlib import Path
from geometric_witnesses import *
class GeometricWitnessTests(unittest.TestCase):
 def test_segment_reachability_including_crossings_and_touches(self):
  self.assertTrue(intersect((0,0),(10,10),(0,10),(10,0)));self.assertTrue(intersect((0,0),(10,0),(10,0),(20,0)));self.assertFalse(intersect((0,0),(1,0),(2,0),(3,0)))
  parse_snow(format_snow([((0,0),[((0,0),(10,10)),((0,10),(10,0))])]))
  with self.assertRaises(AssertionError):parse_snow(format_snow([((0,0),[((0,0),(1,0)),((2,0),(3,0))])]))
 def test_snow_exact_halfminute_and_hours_conversion(self):
  data=format_snow([((0,0),[((0,0),(250,0))]),((0,0),[((0,0),(10000,0))])]);self.assertEqual(snow_output(data),'0:02\n\n1:00\n');self.assertTrue(snow_valid(data,'0:01\n\n1:00'));self.assertFalse(snow_valid(data,'0:03\n\n1:00'))
 def test_projection_clipping_midpoint_and_translation_invariance(self):
  self.assertEqual(pollution((-16,0,0),(16,0,0),[((16,0,0),1)]),Decimal('3.125'));self.assertEqual(pollution((0,0,0),(10,0,0),[((0,0,0),5)]),50);self.assertEqual(pollution((0,0,0),(10,0,0),[((5,1,0),1)]),0);self.assertEqual(pollution((0,0,0),(10,0,0),[((20,0,0),1)]),0)
  rng=random.Random(10355)
  for _ in range(100):
   start=tuple(rng.randrange(-10,11) for _ in range(3));end=tuple(rng.randrange(-10,11) for _ in range(3));center=tuple(rng.randrange(-10,11) for _ in range(3));radius=rng.randrange(1,11);shift=(3,-5,7)
   if start==end:continue
   move=lambda point:tuple(a+b for a,b in zip(point,shift));self.assertEqual(pollution(start,end,[(center,radius)]),pollution(move(start),move(end),[(move(center),radius)]))
 def test_two_circle_closed_form_and_integer_grid_packing(self):
  with localcontext() as context:
   context.prec=75
   for a in range(1,10):
    for b in range(1,10):self.assertEqual(box_width((Decimal(a),Decimal(b))),max(2*a,2*b,Decimal(a+b)+2*Decimal(a*b).sqrt()))
  for radii in [(1,1,4),(1,4,9),(4,1,4),(1,1,1)]:
   optimum=None
   for width in range(2*max(radii),2*sum(radii)+1):
    for centers in itertools.product(*(range(radius,width-radius+1) for radius in radii)):
     if all((centers[i]-centers[j])**2>=4*radii[i]*radii[j] for i in range(3) for j in range(i+1,3)):optimum=width;break
    if optimum is not None:break
   self.assertEqual(box_width(tuple(map(Decimal,radii))),optimum)
 def test_radius_precision_and_nearest_width_contract(self):
  self.assertTrue(box_valid('1\n1 0.00025','0.000'));self.assertTrue(box_valid('1\n1 0.00025','0.001'));self.assertFalse(box_valid('1\n1 0.00025','0.002'))
  for radius in ['1.0000001','1e-7','1.000000000000000000000000000000001']:
   with self.assertRaises(AssertionError):parse_boxes('1\n1 '+radius)
 def test_canonical_programs_against_independent_geometry(self):
  headers='\n'.join('#include <'+h+'>' for h in ['iostream','vector','array','string','sstream','iomanip','cmath','algorithm','numeric','functional'])
  with tempfile.TemporaryDirectory() as directory:
   path=Path(directory)
   for slug,inputs in additions().items():
    source=(ROOT/'content/editorials'/slug/'cpp17.cpp').read_text().replace('#include <bits/stdc++.h>',headers);(path/'main.cpp').write_text(source);subprocess.run(['c++','-std=c++17','-O2',str(path/'main.cpp'),'-o',str(path/'reference')],capture_output=True,check=True)
    for data in inputs:
     result=subprocess.run([str(path/'reference')],input=data,text=True,capture_output=True,check=True);self.assertTrue(ORACLES[slug][1](data,result.stdout),slug)
if __name__=='__main__':unittest.main()
