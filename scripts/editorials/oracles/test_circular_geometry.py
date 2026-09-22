import math,random,subprocess,tempfile,unittest
from decimal import Decimal,localcontext
from pathlib import Path
from circular_geometry import *
class CircularGeometryTests(unittest.TestCase):
 def test_pi_against_independent_machin_arctangent_series(self):
  with localcontext() as context:
   context.prec=80
   def atan(x):
    term=x;total=x;k=1
    while abs(term)>Decimal('1e-78'):term*=-x*x;total+=term/(2*k+1);k+=1
    return total
   self.assertLess(abs(PI-(16*atan(Decimal(1)/5)-4*atan(Decimal(1)/239))),Decimal('1e-75'))
 def test_coverage_equations_match_independent_spatial_integration(self):
  n=400;count={2:0,3:0,4:0}
  for i in range(n):
   for j in range(n):
    x,y=(i+.5)/n,(j+.5)/n;coverage=sum((x-a)**2+(y-b)**2<=1 for a,b in [(0,0),(1,0),(1,1),(0,1)]);count[coverage]+=1
  values=regions(Decimal(1))
  for coverage,value in zip([4,3,2],values):self.assertLess(abs(count[coverage]/(n*n)-float(value)),0.0005)
  self.assertEqual(regions(Decimal(0)),[0,0,0]);self.assertEqual(integration_output('0.1\n0.2\n0.3\n'),'0.003 0.005 0.002\n0.013 0.020 0.007\n0.028 0.046 0.016\n')
 def test_known_angles_unit_conversion_and_short_arc_symmetry(self):
  with localcontext() as context:
   context.prec=75
   for height in [0,500,100000]:
    radius=Decimal(height+6440)
    for angle in [0,1,30,60,90,179,180]:
     arc,chord=satellite_values(height,angle,'deg');self.assertEqual((arc,chord),satellite_values(height,angle*60,'min'));self.assertEqual((arc,chord),satellite_values(height,360-angle,'deg'));self.assertLessEqual(chord,arc+Decimal('1e-65'))
    self.assertLess(abs(satellite_values(height,60,'deg')[1]-radius),Decimal('1e-65'));self.assertLess(abs(satellite_values(height,180,'deg')[1]-2*radius),Decimal('1e-65'));self.assertEqual(satellite_values(height,360,'deg'),(0,0))
 def test_canonical_closed_form_and_trigonometry_match_independent_oracles(self):
  headers='\n'.join('#include <'+h+'>' for h in ['iostream','string','iomanip','cmath'])
  with tempfile.TemporaryDirectory() as directory:
   path=Path(directory)
   for slug,inputs in additions().items():
    source=(ROOT/'content/editorials'/slug/'cpp17.cpp').read_text().replace('#include <bits/stdc++.h>',headers);(path/'main.cpp').write_text(source);subprocess.run(['c++','-std=c++17','-O2',str(path/'main.cpp'),'-o',str(path/'reference')],capture_output=True,check=True)
    for data in inputs:
     result=subprocess.run([str(path/'reference')],input=data,text=True,capture_output=True,check=True);self.assertTrue(matches(ORACLES[slug](data),result.stdout),slug)
if __name__=='__main__':unittest.main()
